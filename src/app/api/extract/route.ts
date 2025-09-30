import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file temporarily
    // const tempPath = path.join(process.cwd(), "temp.pdf");
    const arrayBuffer = await file.arrayBuffer();
    // fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));

    // Parse PDF
    // const pdfData = await pdf(fs.readFileSync(tempPath));
    const pdfData = await pdf(Buffer.from(arrayBuffer));
    const text = pdfData.text;

    // Remove temporary file
    // fs.unlinkSync(tempPath);

    // Extract info
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex =
      /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}/;

    const email = text.match(emailRegex)?.[0] ?? "Not found";
    const phone = text.match(phoneRegex)?.[0] ?? "Not found";

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let name = "Not found";
    if (lines.length) {
      const guess = lines.find(
        (l) => !l.match(emailRegex) && !l.match(phoneRegex)
      );
      if (guess) name = guess;
    }

    return NextResponse.json({ name, email, phone });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
