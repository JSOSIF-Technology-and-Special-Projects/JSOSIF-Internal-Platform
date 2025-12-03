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

		const rows = parseTransactions(text);

		const worksheet = XLSX.utils.json_to_sheet(rows);

		const workbook = XLSX.utils.book_new();
    	XLSX.utils.book_append_sheet(workbook, worksheet, "Presidents");

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
	
	const rows: any[] = [];
	const lines = text.split("\n").map((line) => line.trim()).filter(
		l => l !== "" && 
		l !== "-" && 
		l!== "Account Number: 558-82235" && 
		l!=="Details of Your Account Holdings - continued" &&
		!(l.includes("--")) &&
		!(l.includes("Page")) &&
		!(l.includes("-")),
	);
	

	const startIndex = lines.findIndex(line =>/details?\s+of\s+your\s+account\s+holdings/i.test(line));
	const endIndex = lines.findIndex(line => /Top?\s+Space/i.test(line));

	//const endIndex = lines.findIndex(line =>/monthly?\s+activity/i.test(line));



	const cleanedLines = lines.slice(startIndex, endIndex);

	const cashStart = cleanedLines.findIndex(line => /Cash?\s/i.test(line));
	const fixedIncomeStart = cleanedLines.findIndex(line => /Fixed?\s+Income/i.test(line));
	const equityStart = cleanedLines.findIndex(line => /Equity?\s/i.test(line));

	const cashLines = cleanedLines.slice(cashStart, fixedIncomeStart);
	const fixedIncomeLines = cleanedLines.slice(fixedIncomeStart, equityStart-1);
	const equityLines = cleanedLines.slice(equityStart, endIndex);

	const cashSheet = parseCash(cashLines);
	const fixedIncomeSheet = parseFixedIncome(fixedIncomeLines);
	//rows.push(cashSheet);
	


	/*rows.push({
      type: 'Type',
      description: 'Security Description',
      quantity: 'Quantity',
      averageCost: 'Average Cost',
      bookValue: 'Adjusted Book Value',
      marketPrice: 'Market Price',
      marketValue: 'Market Value',
    });*/
	for (const line of cleanedLines){
		const words = line.split(" ");
		rows.push(words);
		
	}

	//console.log(rows);

	return rows;
}

function parseCash(lines: string[]){
	const rows: any[] = [];

	for (const line of lines){
		const words = line.split(" ");
		const finalWord = words[words.length-1];
		words.splice(words.length-1, words.length);
		const firstWord = words.join();
		const finalRows = [firstWord, finalWord];
		rows.push(finalRows);
	}
	return rows;
}

function parseFixedIncome(lines: string[]){
	const accruedInterestStart = lines.findIndex(line => /Accrued?\s+Interest:/i.test(line));
	const rows: any[] = [];
	const incomeLines = lines.splice(0, accruedInterestStart);

	for (const line of incomeLines){
	
		const words = line.split(" ");
		if(words[0]=="DUE"){
			const dueDate = words.join;
			
		}
		const marketValue = words[words.length-1];
		const marketPrice = words[words.length-2];
		const adjustedBookValue = words[words.length-3];
		const averageCost = words[words.length-4];
		const quantity = words[words.length-5];
		const type = words[0];
		words.splice(words.length-5, words.length);
		const securityDescription = words.join();
		const finalRows = [type, securityDescription, quantity, averageCost, adjustedBookValue, marketPrice, marketValue];
		rows.push(finalRows);
	}
	
	return rows;
}

function parseEquity(lines: string[]){
	
}