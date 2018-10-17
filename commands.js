const fs = require('fs');
const readline = require('readline');

setUpLineReader = fileName => {
    return readline.createInterface({
        input: fs.createReadStream(fileName)
    })
}

done = (output) => {
    process.stdout.write(output);
    process.stdout.write('\nprompt > ');
}

evaluateCmd = (userInput) => {
    const userInputArray = userInput.split(" ");
    const command = userInputArray[0];

    switch (command) {
        case "echo":
            commandLibrary.echo(userInputArray.slice(1).join(" "));
            break;
        case "cat":
            commandLibrary.cat(userInputArray.slice(1));
            break;
        case "wc": 
            commandLibrary.wc(userInputArray.slice(1));
            break;
        case "sort":
            commandLibrary.sort(userInputArray.slice(1));
            break;
        case "uniq":
            commandLibrary.uniq(userInputArray.slice(1));
            break;
    }
}

const commandLibrary = {
    echo: (userInput) => {
        done(userInput);
    },
    cat: (fullPath) => {
        const fileName = fullPath[0];
        fs.readFile(fileName, 'utf8', (err, data) => {
            if (err) throw err;
            done(data);
        });
    },
    wc: (fullPath) => {
        const fileName = fullPath[0];
        const fileSize = fs.statSync(fileName).size;
        
        try {
            const words = fs.readFileSync(fileName, 'utf8').replace(/\r\n/g, " ").split(' ');
            let wordCount = 0;
            for (let i = 0; i < words.length; i++) {
                if (words[i]) {
                    wordCount++;
                }
            }
            const lineReader = setUpLineReader(fileName);
            let count = 0;
            lineReader.on('line', (line) => {
                count++;
            }).on('close', function() {
                done(`${count} ${wordCount} ${fileSize}`);
            });
        } catch (err) {
            console.error(err);
        }        
    },
    sort: (fullPath) => {
        const fileName = fullPath[0];

        const lineReader = setUpLineReader(fileName);
        let lines = [];
        lineReader.on('line', (line) => {
            lines.push(line);
        }).on('close', () => {
            let sortedLines = lines.sort((a, b) => {
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            });
            done(sortedLines.join('\n'));
        });        
    },
    uniq: (fullPath) => {
        const fileName = fullPath[0];
        const lineReader = setUpLineReader(fileName);
        let lines = [];
        lineReader.on('line', line => {
            lines.push(line);
        }).on('close', () => {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i] === lines[i+1]) {
                    lines.splice(i, 1);
                    i--;
                }
            }
            done(lines.join('\n'));;
        });
    }
};

module.exports.commandLibrary = commandLibrary;
module.exports.evaluateCmd = evaluateCmd;