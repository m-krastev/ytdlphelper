document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const fileNameInput = document.getElementById('fileName');
    const outputFolderInput = document.getElementById('outputFolder');
    const extractAudioCheckbox = document.getElementById('extractAudio');
    const audioFormatSelect = document.getElementById('audioFormat');
    const audioFormatGroup = document.getElementById('audioFormatGroup');
    const qualitySelect = document.getElementById('quality');
    const videoQualityGroup = document.getElementById('videoQualityGroup');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const generatedCommandOutput = document.getElementById('generatedCommand');
    const copyCommandBtn = document.getElementById('copyCommandBtn');
    const copyStatusMessage = document.getElementById('copyStatus');

    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to generate the command
    function generateCommand() {
        const videoUrl = videoUrlInput.value.trim();
        let command = 'yt-dlp';
        const flags = [];

        // Output Filename (-o flag)
        const customFileName = fileNameInput.value.trim();
        if (customFileName) {
            flags.push(`-o "${customFileName}"`);
        }

        // Output Folder (-P flag)
        const outputFolder = outputFolderInput.value.trim();
        if (outputFolder) {
            flags.push(`-P "${outputFolder}"`);
        }

        // Extract Audio Only (-x)
        if (extractAudioCheckbox.checked) {
            flags.push('-x'); // extract audio flag
            const audioFormat = audioFormatSelect.value;
            if (audioFormat !== 'best') { // 'best' means no specific format, yt-dlp decides
                flags.push(`--audio-format ${audioFormat}`);
            }
        } else {
            // Video Quality (-f flag)
            const quality = qualitySelect.value;
            if (quality !== 'bestvideo+bestaudio/best') { // If not default, add format selection
                flags.push(`-f "${quality}"`);
            }
        }

        // Start and End Time (--download-sections)
        const startTime = startTimeInput.value.trim();
        const endTime = endTimeInput.value.trim();

        if (startTime || endTime) {
            let section = '*'; // Important for --download-sections
            if (startTime) {
                section += startTime;
            } else {
                section += '0'; // Start from beginning if no start time
            }
            section += '-';
            if (endTime) {
                section += 'inf'; // Go to end if no end time
            }
            flags.push(`--download-sections "${section}"`);
            flags.push('--force-keyframes-at-cuts'); // For more accurate trimming
        }

        // Construct the full command
        command += ` ${flags.join(' ')}`;
        if (videoUrl) {
            command += ` "${videoUrl}"`;
        } else {
            command += ` "YOUR_VIDEO_URL"`; // Placeholder if URL is empty
        }

        generatedCommandOutput.textContent = command;
    }

    // Toggle visibility of audio/video options based on checkbox
    function toggleOptionsVisibility() {
        if (extractAudioCheckbox.checked) {
            audioFormatGroup.style.display = 'flex';
            videoQualityGroup.style.display = 'none';
        } else {
            audioFormatGroup.style.display = 'none';
            videoQualityGroup.style.display = 'flex';
        }
    }

    // Function to show a specific tab
    function showTab(tabId) {
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`).classList.add('active');
    }

    // Event Listeners
    videoUrlInput.addEventListener('input', generateCommand);
    fileNameInput.addEventListener('input', generateCommand);
    outputFolderInput.addEventListener('input', generateCommand);
    extractAudioCheckbox.addEventListener('change', () => {
        toggleOptionsVisibility();
        generateCommand();
    });
    audioFormatSelect.addEventListener('change', generateCommand);
    qualitySelect.addEventListener('change', generateCommand);
    startTimeInput.addEventListener('input', generateCommand);
    endTimeInput.addEventListener('input', generateCommand);
    copyCommandBtn.addEventListener('click', () => {
        const commandText = generatedCommandOutput.textContent;
        navigator.clipboard.writeText(commandText).then(() => {
            copyStatusMessage.textContent = 'Command copied!';
            setTimeout(() => {
                copyStatusMessage.textContent = '';
            }, 2000); // Clear message after 2 seconds
        }).catch(err => {
            console.error('Failed to copy command: ', err);
            copyStatusMessage.textContent = 'Failed to copy command. Please copy manually.';
        });
    });

    // Tab button event listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(`${button.dataset.tab}-tab`);
        });
    });

    // Initial generation and visibility setup on page load
    toggleOptionsVisibility();
    generateCommand();
    showTab('windows-tab'); // Show Windows tab by default
});
