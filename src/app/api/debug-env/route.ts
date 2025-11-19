import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

interface DiagnosticResult {
  variable: string;
  exists: boolean;
  issues: string[];
  warnings: string[];
  parsed: {
    protocol?: string;
    hostname?: string;
    port?: string;
    database?: string;
    hasPassword: boolean;
    hasQueryParams: boolean;
  } | null;
  connectionTest?: {
    attempted: boolean;
    success: boolean;
    error?: string;
    errorCode?: string;
    errorType?: string;
    prismaErrorCode?: string;
    httpStatus?: number;
  };
}

function diagnoseConnectionString(
  varName: string,
  value: string | undefined
): DiagnosticResult {
  const result: DiagnosticResult = {
    variable: varName,
    exists: !!value,
    issues: [],
    warnings: [],
    parsed: null,
  };

  // Check if variable exists
  if (!value) {
    result.issues.push(`Variable ${varName} is not set in environment`);
    return result;
  }

  // Check for common formatting issues
  const trimmed = value.trim();

  // Check for double quotes at start/end
  if (trimmed.startsWith('""') || trimmed.endsWith('""')) {
    result.issues.push("Has double quotes (likely copy-paste issue)");
  }

  // Check for line breaks in the middle
  if (trimmed.includes("\n") || trimmed.includes("\r")) {
    result.issues.push("Contains line breaks in the middle of the URL");
  }

  // Check for extra spaces
  if (value !== trimmed) {
    result.warnings.push("Has leading/trailing whitespace");
  }

  // Check if it's quoted correctly
  const hasQuotes = trimmed.startsWith('"') && trimmed.endsWith('"');
  const unquoted = hasQuotes ? trimmed.slice(1, -1) : trimmed;

  // Check for postgres protocol
  if (
    !unquoted.startsWith("postgresql://") &&
    !unquoted.startsWith("postgres://")
  ) {
    result.issues.push("Does not start with 'postgresql://' or 'postgres://'");
  }

  // Try to parse the URL
  try {
    const url = new URL(unquoted);
    result.parsed = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      database: url.pathname.slice(1), // Remove leading /
      hasPassword: !!url.password,
      hasQueryParams: url.search.length > 0,
    };

    // Validate specific parts
    if (!url.hostname.includes("supabase")) {
      result.warnings.push("Hostname does not contain 'supabase'");
    }

    if (varName === "DATABASE_POOL_URL") {
      if (!url.hostname.includes("pooler")) {
        result.warnings.push("Pool URL should contain 'pooler' in hostname");
      }
      if (url.port !== "6543") {
        result.warnings.push(
          `Pool URL should use port 6543, found ${url.port || "none"}`
        );
      }
      if (!url.searchParams.has("pgbouncer")) {
        result.warnings.push(
          "Pool URL should have 'pgbouncer=true' in query params"
        );
      }
    }

    if (varName === "DATABASE_DIRECT_URL") {
      if (url.hostname.includes("pooler")) {
        result.warnings.push(
          "Direct URL should NOT contain 'pooler' in hostname"
        );
      }
      if (url.port !== "5432") {
        result.warnings.push(
          `Direct URL should use port 5432, found ${url.port || "none"}`
        );
      }
    }

    if (!url.password) {
      result.issues.push("Missing password in connection string");
    }

    if (!url.username) {
      result.issues.push("Missing username in connection string");
    }

    // Check for SSL mode
    if (!url.searchParams.has("sslmode")) {
      result.warnings.push(
        "Missing 'sslmode=require' in query params (recommended)"
      );
    }
  } catch (error) {
    result.issues.push(
      `Invalid URL format: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return result;
}

async function testConnection(
  varName: string,
  connectionString: string | undefined
): Promise<DiagnosticResult["connectionTest"]> {
  if (!connectionString) {
    return { attempted: false, success: false };
  }

  // Remove quotes if present
  const unquoted = connectionString.trim().replace(/^"|"$/g, "");

  try {
    // Create a temporary Prisma client with this connection string
    const testClient = new PrismaClient({
      datasources: {
        db: {
          url: unquoted,
        },
      },
      log: ["error"],
    });

    // Try to connect with a timeout
    const connectPromise = testClient.$connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Connection timeout after 10 seconds")),
        10000
      )
    );

    await Promise.race([connectPromise, timeoutPromise]);

    // Try a simple query
    await testClient.$queryRaw`SELECT 1 as test`;

    await testClient.$disconnect();

    return {
      attempted: true,
      success: true,
    };
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorCode: string | undefined;
    let errorType: string | undefined;
    let prismaErrorCode: string | undefined;
    let httpStatus: number | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorType = error.constructor.name;

      // Check if it's a Prisma error with error codes
      const prismaError = error as any;
      if (prismaError.code) {
        prismaErrorCode = prismaError.code;
        errorCode = prismaError.code;
      }
      if (prismaError.meta) {
        // Include meta information if available
        errorMessage += ` (Meta: ${JSON.stringify(prismaError.meta)})`;
      }

      // Map Prisma error codes to human-readable messages
      const prismaErrorCodeMap: Record<string, string> = {
        P1000: "Authentication failed - check username/password",
        P1001:
          "Can't reach database server - database might be paused, network blocked, or hostname incorrect",
        P1002: "Database server doesn't accept TCP/IP connections",
        P1003: "Database does not exist",
        P1008: "Operations timed out - database might be paused or slow",
        P1009: "Database already exists",
        P1010: "User was denied access - check credentials",
        P1011: "TLS connection error - SSL/TLS configuration issue",
        P1012: "Error opening a TLS connection",
        P1013: "The provided database string is invalid",
        P1014: "The underlying kind for a model does not exist",
        P1015: "Your Prisma schema is using features that are not supported",
        P1016: "Your raw query had an incorrect number of parameters",
        P1017: "Server has closed the connection - database might be paused",
        P2024: "Connection pool timeout",
        P2025: "Record to update not found",
        P3009: "Migration failed to apply - database might be paused",
        P4000: "Introspection failed",
        P4001: "Introspection timed out",
        P4002: "Introspection failed - database might be paused",
      };

      // Use Prisma error code message if available
      if (prismaErrorCode && prismaErrorCodeMap[prismaErrorCode]) {
        errorMessage = `${prismaErrorCodeMap[prismaErrorCode]} (Code: ${prismaErrorCode})`;
      } else {
        // Parse common error patterns
        if (errorMessage.includes("Can't reach database server")) {
          errorMessage =
            "Cannot reach database server - check if database is paused or network is blocking";
        } else if (errorMessage.includes("authentication failed")) {
          errorMessage = "Authentication failed - check username/password";
        } else if (errorMessage.includes("timeout")) {
          errorMessage =
            "Connection timeout - database might be paused or unreachable";
        } else if (
          errorMessage.includes("ENOTFOUND") ||
          errorMessage.includes("getaddrinfo")
        ) {
          errorMessage = "DNS resolution failed - hostname might be incorrect";
        } else if (errorMessage.includes("ECONNREFUSED")) {
          errorMessage =
            "Connection refused - port might be wrong or firewall blocking";
        } else if (errorMessage.includes("ETIMEDOUT")) {
          errorMessage =
            "Connection timeout - network issue or database unreachable";
        } else if (errorMessage.includes("ECONNRESET")) {
          errorMessage =
            "Connection reset by server - database might be paused";
        }
      }

      // Check for HTTP status codes in error
      if (prismaError.statusCode) {
        httpStatus = prismaError.statusCode;
      }
    }

    return {
      attempted: true,
      success: false,
      error: errorMessage,
      errorCode,
      errorType,
      prismaErrorCode,
      httpStatus,
    };
  }
}

export async function GET() {
  const poolUrl = process.env.DATABASE_POOL_URL;
  const directUrl = process.env.DATABASE_DIRECT_URL;

  // Diagnose both connection strings
  const poolDiagnosis = diagnoseConnectionString("DATABASE_POOL_URL", poolUrl);
  const directDiagnosis = diagnoseConnectionString(
    "DATABASE_DIRECT_URL",
    directUrl
  );

  // Test connections (only if no critical issues found)
  const poolHasCriticalIssues = poolDiagnosis.issues.some(
    (issue) => issue.includes("not set") || issue.includes("Invalid URL")
  );
  const directHasCriticalIssues = directDiagnosis.issues.some(
    (issue) => issue.includes("not set") || issue.includes("Invalid URL")
  );

  if (!poolHasCriticalIssues) {
    poolDiagnosis.connectionTest = await testConnection(
      "DATABASE_POOL_URL",
      poolUrl
    );
  }

  if (!directHasCriticalIssues) {
    directDiagnosis.connectionTest = await testConnection(
      "DATABASE_DIRECT_URL",
      directUrl
    );
  }

  // Overall assessment
  const allIssues = [...poolDiagnosis.issues, ...directDiagnosis.issues];
  const allWarnings = [...poolDiagnosis.warnings, ...directDiagnosis.warnings];
  const connectionTests = [
    poolDiagnosis.connectionTest,
    directDiagnosis.connectionTest,
  ].filter(Boolean);

  const overallStatus =
    allIssues.length === 0 && connectionTests.every((test) => test?.success)
      ? "✅ All checks passed"
      : allIssues.length > 0
      ? "❌ Critical issues found"
      : connectionTests.some((test) => !test?.success)
      ? "⚠️ Connection test failed"
      : "⚠️ Warnings found";

  return NextResponse.json(
    {
      overall_status: overallStatus,
      timestamp: new Date().toISOString(),
      diagnostics: {
        DATABASE_POOL_URL: poolDiagnosis,
        DATABASE_DIRECT_URL: directDiagnosis,
      },
      summary: {
        critical_issues: allIssues,
        warnings: allWarnings,
        recommendations: [
          ...(allIssues.length > 0
            ? [
                "Fix critical issues above before proceeding",
                "Check .env file is in project root",
                "Verify .env file has no syntax errors",
              ]
            : []),
          ...(connectionTests.some((test) => !test?.success)
            ? [
                "Check Supabase dashboard - database might be paused",
                "Verify network/firewall allows connection to Supabase",
                "Try: npx prisma db pull --print for more details",
              ]
            : []),
          ...(allWarnings.length > 0
            ? ["Review warnings above - they may cause issues"]
            : []),
          "Restart dev server after fixing .env file",
          "Run 'npx prisma generate' if you haven't already",
        ],
      },
    },
    {
      status:
        allIssues.length > 0 || connectionTests.some((test) => !test?.success)
          ? 500
          : 200,
    }
  );
}
