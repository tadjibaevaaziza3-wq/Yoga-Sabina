
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const VIDEOS_DIR = path.join(process.cwd(), "../resources"); // Adjust path if needed
const KB_DIR = path.join(process.cwd(), "src/lib/ai/knowledge-base");
const OUTPUT_FILE = path.join(KB_DIR, "videos.json");

// Ensure KB directory exists
if (!fs.existsSync(KB_DIR)) {
    fs.mkdirSync(KB_DIR, { recursive: true });
}

// List of videos to process
const VIDEO_FILES = ["Full_1.mp4", "full  mb.mp4"]; // Note the double space in filename

async function uploadFile(filePath: string, mimeType: string) {
    console.log(`Uploading ${filePath}...`);
    const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType,
        displayName: path.basename(filePath),
    });
    console.log(`Uploaded ${uploadResult.file.displayName} as: ${uploadResult.file.name}`);
    return uploadResult.file;
}

async function waitForActive(file: any) {
    console.log(`Waiting for ${file.displayName} to process...`);
    let fileStatus = await fileManager.getFile(file.name);
    while (fileStatus.state === FileState.PROCESSING) {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Sleep 5s
        fileStatus = await fileManager.getFile(file.name);
    }
    console.log(`\nFile ${file.displayName} is ready: ${fileStatus.state}`);
    if (fileStatus.state === FileState.FAILED) {
        throw new Error("Video processing failed.");
    }
    return fileStatus;
}

async function generateTranscript(fileUri: string, displayName: string) {
    console.log(`Generating transcript for ${displayName}...`);
    const result = await model.generateContent([
        {
            fileData: {
                mimeType: "video/mp4",
                fileUri: fileUri,
            },
        },
        {
            text: `Please verify this is a yoga instructional video. 
            Detailed Task: Create a comprehensive knowledge base entry from this video.
            1.  **Summary**: A concise summary of the session.
            2.  **Key Topics**: Bullet points of main exercises or discussions.
            3.  **Detailed Transcript/Description**: A detailed step-by-step description of the instructions given, covering the entire duration. 
            Focus on the physical movements, breathing instructions, and any safety advice.
            Output in JSON format with keys: "summary", "topics", "transcript".`
        },
    ]);

    const text = result.response.text();
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.warn("Failed to parse JSON, returning raw text", e);
        return { raw: text };
    }
}

async function main() {
    const knowledgeBase: Record<string, any> = {};

    for (const fileName of VIDEO_FILES) {
        const filePath = path.join(VIDEOS_DIR, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        try {
            const uploadResponse = await uploadFile(filePath, "video/mp4");
            const activeFile = await waitForActive(uploadResponse);
            const content = await generateTranscript(activeFile.uri, fileName);

            knowledgeBase[fileName] = content;
            console.log(`Successfully processed ${fileName}`);
        } catch (error) {
            console.error(`Error processing ${fileName}:`, error);
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(knowledgeBase, null, 2), "utf-8");
    console.log(`Knowledge base saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
