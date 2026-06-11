import fs from 'fs';
import  csv from 'csv-parser';
import path  from 'path';


async function getEmbedding(text) {

    const response = await fetch(
        'http://localhost:11434/api/embeddings',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nomic-embed-text',
                prompt: text
            })
        }
    );

    const data = await response.json();

    return data.embedding;
}

async function main() {

    const docsFolder = './docs';
    const embeddingFolder = './embeddings';

    if (!fs.existsSync(embeddingFolder)) {
        fs.mkdirSync(embeddingFolder);
    }

    const files = fs.readdirSync(docsFolder);

    for (const file of files) {

        const fullPath =
            path.join(docsFolder, file);

        const text =
            fs.readFileSync(
                fullPath,
                'utf8'
            );

        console.log(
            `Embedding ${file}`
        );

        const embedding =
            await getEmbedding(text);

        const outputFile =
            path.join(
                embeddingFolder,
                file.replace('.txt', '.json')
            );

        fs.writeFileSync(
            outputFile,
            JSON.stringify(
                {
                    source: file,
                    text: text,
                    embedding: embedding
                },
                null,
                2
            )
        );
    }

    console.log('Done');
}

main();