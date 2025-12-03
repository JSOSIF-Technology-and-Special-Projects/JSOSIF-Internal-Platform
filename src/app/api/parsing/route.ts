import { NextRequest, NextResponse } from 'next/server';
import "pdf-parse/worker";
import {PDFParse,VerbosityLevel} from "pdf-parse";
import { error } from 'console';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
	try{
		const formData = await request.formData();
		const file = formData.get("file") as File;
		if (!file){
			return NextResponse.json(
				{error: "PDF file not found"},
				{status: 400}
			);
		}

		const arrayBuffer = await file.arrayBuffer();

		const parser = new PDFParse({
			data: arrayBuffer, 
			verbosity: VerbosityLevel.WARNINGS
		});
		
		const data = await parser.getText();
		const text = data.text;
	
		await parser.destroy;
		const workbook = XLSX.utils.book_new();
		const sheets = parseTransactions(text);
		const sheetNames = ["Cash", "Fixed Income", "Equity", "Monthly Activity"];

		
		sheets.forEach((sheet, index) => {
			const worksheet = XLSX.utils.json_to_sheet(sheet);
			XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[index]);
		});


		const excelBuffer = XLSX.write(workbook, {
      		type: "buffer",
      		bookType: "xlsx",
    	});

		return new NextResponse(excelBuffer, {
			headers: {
				"Content-Type":
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"Content-Disposition": "attachment; filename=parsed.xlsx",
			},
    	});
	} catch{
		console.error("PDF parsing error:", error);
		return NextResponse.json(
			{error: "An error occured while processing the PDF"},
			{status: 500}
		)
		
	}
}

function parseTransactions(text: string){
	
	const sheets: any[] = [];
	const lines = text.split("\n").map((line) => line.trim()).filter(
		l => l !== "" && 
		l !== "-" && 
		l!== "Account Number: 558-82235" && 
		l!=="Details of Your Account Holdings - continued" &&
		!(l.includes("--")) &&
		!(l.includes("Page")) &&
		!(l.includes("continued")) &&
		!(l.includes("SWSTM")) &&
		!(l.includes("Statement")) &&
		!(l.includes("Type")) &&
		!(l.includes("Cost")) &&
		!(l.includes("Adjusted")) &&
		!(l.includes("Book")) &&
		!(l.includes("Market")) &&
		l !== "xxxx" &&
		l !== "xxx",
	);

	const startIndex = lines.findIndex(line =>/Details?\s+of\s+your\s+account\s+holdings/i.test(line));
	const endIndex = lines.findIndex(line => /^Summary$/i.test(line.trim()));

	const cleanedLines = lines.slice(startIndex, endIndex);

	const cashStart = cleanedLines.findIndex(line => /Cash/i.test(line));
    const fixedIncomeStart = cleanedLines.findIndex(line => /Fixed\s+Income/i.test(line));
    const equityStart = cleanedLines.findIndex(line => /Equity/i.test(line));
	const equityEnd = cleanedLines.findIndex(line => /Top\s+Space/i.test(line));
	const monthlyActivityStart = cleanedLines.findIndex(line => /Monthly\s+Activity/i.test(line));

	const cashLines = cleanedLines.slice(cashStart, fixedIncomeStart);
	const fixedIncomeLines = cleanedLines.slice(fixedIncomeStart, equityStart);
	const equityLines = cleanedLines.slice(equityStart, equityEnd);
	const monthlyActivityLines = cleanedLines.slice(monthlyActivityStart, endIndex);


	const cashSheet = parseCash(cashLines);
	const fixedIncomeSheet = parseFixedIncome(fixedIncomeLines);
	const equitySheet = parseEquity(equityLines);
	const monthlyActivitySheet = parseMonthlyActivity(monthlyActivityLines);
	console.log(monthlyActivityLines);

	sheets.push(cashSheet);
	sheets.push(fixedIncomeSheet);
	sheets.push(equitySheet);
	sheets.push(monthlyActivitySheet);

	return sheets;
}

function parseCash(lines: string[]){
	const rows: any[] = [];
	const heading = ["Type", "Market Value"]
	rows.push(heading);

	for (const line of lines){
		const words = line.split(" ");
		if(words.length<2){
            continue;
        }
		const finalWord = words[words.length-1];
		words.splice(words.length-1, words.length);
		const firstWord = words.join(" ");
		const finalRows = [firstWord, finalWord];
		rows.push(finalRows);
	}
	return rows;
}

function parseFixedIncome(lines: string[]){
	const accruedInterestStart = lines.findIndex(line => /Accrued\s+Interest:/i.test(line));
	const rows: any[] = [];
	const incomeLines = lines.slice(0, accruedInterestStart);
	const interestLines = lines.slice(accruedInterestStart, lines.length);

	const heading=['Type', 'Security Description','Quantity', 'Average Cost','Adjusted Book Value','Market Price','Market Value', 'Due Date'];
	rows.push(heading);
	
	for (const line of incomeLines){
	
		const words = line.split(" ");
		if(words[0]==="DUE"){
			const dueDate = words.join(" ");
			rows[rows.length-1].push(dueDate);
			continue;
		}
		if(line === incomeLines[incomeLines.length-1]){
			const finalWord = words[words.length-1];
			words.splice(words.length-1, words.length);
			const firstWord = words.join(" ");
			const finalRows = [firstWord, "", "", "", "", "", finalWord];
			rows.push(finalRows);
			continue;
		}
		if(words.length<=7){
            continue;
        }
		const marketValue = words[words.length-1];
		const marketPrice = words[words.length-2];
		const adjustedBookValue = words[words.length-3];
		const averageCost = words[words.length-4];
		const quantity = words[words.length-5];
		const type = words[0];
		words.splice(words.length-5, words.length);
		const securityDescription = words.join(" ");
		const finalRows = [type, securityDescription, quantity, averageCost, adjustedBookValue, marketPrice, marketValue];
		rows.push(finalRows);
	}

	for (const line of interestLines){
		const words = line.split(" ");
		if(line === interestLines[0]){
			rows.push([line]);
			continue;
		}
		if(!(/\d/.test(line))){
            continue;
        }
		if(line === interestLines[interestLines.length-1]){
			const finalWord = words[words.length-1];
			const secondWord = words[words.length-2];
			words.splice(words.length-2, words.length);
			const firstWord = words.join(" ");
			const finalRows = [firstWord, "", "", "", secondWord, "", finalWord];
			rows.push(finalRows);
			continue;
		}
		const finalWord = words[words.length-1];
		words.splice(words.length-1, words.length);
		const firstWord = words.join(" ");
		const finalRows = ["", firstWord, "", "", "", "", finalWord];
		rows.push(finalRows);
	}
	return rows;
}

function parseEquity(lines: string[]){
	const pendingDividendsStart = lines.findIndex(line => /Pending\s+Dividend\(s\):/i.test(line));
	const rows: any[] = [];
	const equityLines = lines.slice(0, pendingDividendsStart);
	const dividendLines = lines.slice(pendingDividendsStart, lines.length);

	const heading=['Type', 'Security Description','Quantity', 'Average Cost','Adjusted Book Value','Market Price','Market Value'];
	rows.push(heading);
	for (const line of equityLines){
	
		const words = line.split(" ");
		if(words.length<7){
			continue;
        }
		const marketValue = words[words.length-1];
		const marketPrice = words[words.length-2];
		const adjustedBookValue = words[words.length-3];
		const averageCost = words[words.length-4];
		const quantity = words[words.length-5];
		const type = words[0];
		words.splice(words.length-5, words.length);
		const securityDescription = words.join(" ");
		const finalRows = [type, securityDescription, quantity, averageCost, adjustedBookValue, marketPrice, marketValue];
		rows.push(finalRows);
	}

	for (const line of dividendLines){
		const words = line.split(" ");
		if(line === dividendLines[0]){
			rows.push([line]);
			continue;
		}
		if(line===dividendLines[dividendLines.length-2] || line===dividendLines[dividendLines.length-1]){
			const finalWord = words[words.length-1];
			const secondWord = words[words.length-2];
			words.splice(words.length-2, words.length);
			const firstWord = words.join(" ");
			const finalRows = [firstWord, "", "", "", secondWord, "", finalWord];
			rows.push(finalRows);
			continue;
		}
		const finalWord = words[words.length-1];
		words.splice(words.length-1, words.length);
		const firstWord = words.join(" ");
		const finalRows = ["", firstWord, "", "", "", "", finalWord];
		rows.push(finalRows);
	}
	return rows;
}

function parseMonthlyActivity(lines: string[]){
	const rows: any[] = [];
	const heading = ["Date", "Type","Activity", "Description", "Quantity", "Price", "Credit/Debit(-)", "Description Details"]
	rows.push(heading);

	for (const line of lines){
		const words = line.split(" ");
		if(line === lines[0]){
			rows.push([line]);
			continue;
		}
		if(line === lines[1] || line === lines[lines.length-1]){
			const finalWord = words[words.length-1];
			words.splice(words.length-1, words.length);
			const firstWord = words.join(" ");
			const finalRows = [firstWord, "", "", "", "", "", finalWord];
			rows.push(finalRows);
			continue;
		}
		if(words.length<7){
			if(line===lines[lines.length-2]){
				continue;
			}
			if (rows[rows.length-1].length==7){
				const notes = words.join(" ");
				rows[rows.length-1].push(notes);
			}
			else{
				const notes = words.join(" ");
				const index = rows[rows.length-1];
				index[index.length-1] = index[index.length-1].concat(notes);
			}
			continue;
		}
		const creditDebit = words[words.length-1];
		const price = words[words.length-2];
		const activity = words[3];
		const type = words[2];
		const date = words.slice(0,2).join(" ");
		words.splice(words.length-2, 2);
		words.splice(0, 4);
		const description = words.join(" ");

		const finalRows = [date, type, activity, description, "", price, creditDebit];
		rows.push(finalRows);
	}

	return rows;
}