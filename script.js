let recognition;

        function startVoiceRecognition() {
            recognition = new webkitSpeechRecognition() || new SpeechRecognition();
            // recognition.lang = 'en-US';
            recognition.lang = 'id-ID';

            recognition.onresult = function (event) {
                const voiceInput = event.results[0][0].transcript;
                document.getElementById('voiceInput').value = voiceInput;
            };

            recognition.start();
        }

        function generateQuote() {
            const name = document.getElementById('name').value;
            const voiceInput = document.getElementById('voiceInput').value;
            const imageUrl = document.getElementById('imageUrl').value;

            const canvasWidth = parseInt(document.getElementById('canvasWidth').value) || 400; // Ukuran default jika tidak diisi
            const canvasHeight = parseInt(document.getElementById('canvasHeight').value) || 250;
            const imageFormat = document.getElementById('imageFormat').value || 'jpeg';

            // Menampilkan preview
            document.getElementById('previewName').innerText = 'Nama Pengisi : ' + name;
            document.getElementById('previewQuote').innerText = 'Voice Quote : ' + voiceInput;
            document.getElementById('previewImage').src = imageUrl;

            // Mengambil elemen canvas dan konteksnya
            const canvas = document.getElementById('quoteCanvas');
            const context = canvas.getContext('2d');

            // Menyesuaikan ukuran canvas sesuai input pengguna
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Menggambar gambar dari URL
            const image = new Image();
            image.crossOrigin = "Anonymous";
            image.src = imageUrl;

            image.onload = function () {
                // Menggambar gambar
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                // Menambahkan teks ke canvas
                context.fillStyle = '#FFF';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.shadowColor = 'rgba(0, 0, 0, 0.25)';
                context.shadowOffsetX = 0.5;
                context.shadowOffsetY = 0.5;
                context.shadowBlur = 1;

                // Calculate a suitable font size based on canvas dimensions
                const maxFontSize = Math.min(canvas.width / 15, canvas.height / 15);
                const fontSize = Math.min(maxFontSize, calculateFontSize(context, voiceInput, canvas.width));

                context.font = `bold ${fontSize}px Montserrat`;

                const textX = canvas.width / 2;
                const textY = canvas.height / 2;

                // Split the voice input into words
                const words = voiceInput.split(' ');

                // Initialize variables for the lines
                let lines = [];
                let currentLine = '';

                // Loop through the words and create lines
                for (let i = 0; i < words.length; i++) {
                    if (i > 0 && i % 10 === 0) {
                        // Add a line break after every 10 words
                        lines.push(currentLine);
                        currentLine = '';
                    }
                    currentLine += words[i] + ' ';
                }

                // Add the last line
                lines.push(currentLine.trim());

                // Draw the lines on the canvas
                lines.forEach((line, index) => {
                    context.fillText(line, textX, textY - fontSize + index * (fontSize + 5)); // Adjusted textY for quote
                });

                // Mengatur teks di bawah kutipan
                //context.fillText(voiceInput, textX, textY - fontSize); // Adjusted textY for quote
                //context.fillText(name, textX, textY + fontSize); // Adjusted textY for name

                // Draw the name
                context.fillText(name, textX, textY + lines.length * (fontSize + 5)); // Adjusted textY for name

                // Menampilkan canvas dan link download
                document.getElementById('canvasContainer').style.display = 'block';

                // Mengonversi canvas ke format yang dipilih dengan kualitas 0.8
                const downloadLink = document.getElementById('downloadCanvasLink');
                downloadLink.href = canvas.toDataURL(`image/${imageFormat}`, 0.8);
                downloadLink.download = `quote_image.${imageFormat}`;
            };

            function calculateFontSize(context, text, maxWidth) {
                let fontSize = 10;

                do {
                    fontSize++;
                    context.font = `bold ${fontSize}px Montserrat`;
                } while (context.measureText(text).width < maxWidth);

                return fontSize;
            }


            // Function to wrap text within a specified width
            function wrapText(text, x, y, maxWidth, lineHeight) {
                const words = text.split(' ');
                let line = '';
                let offsetY = 0;

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const metrics = context.measureText(testLine);
                    const testWidth = metrics.width;

                    if (testWidth > maxWidth && i > 0) {
                        context.fillText(line, x, y + offsetY);
                        line = words[i] + ' ';
                        offsetY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }

                context.fillText(line, x, y + offsetY);
            }

            // Stop voice recognition jika sedang berjalan
            if (recognition) {
                recognition.stop();
            }
        }