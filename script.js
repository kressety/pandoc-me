document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'https://pandoc-api.mealuet.com/';
    const inputText = document.getElementById('inputText');
    const inputFormatSelect = document.getElementById('inputFormat');
    const outputFormatSelect = document.getElementById('outputFormat');
    const convertToFileBtn = document.getElementById('convertToFile');
    const convertToRawBtn = document.getElementById('convertToRaw');
    const fileInput = document.getElementById('fileInput');
    const uploadToRawBtn = document.getElementById('uploadToRaw');
    const outputArea = document.getElementById('outputArea');
    const outputText = document.getElementById('outputText');

    // 获取支持的格式
    async function loadFormats() {
        try {
            const response = await fetch(`${API_BASE}formats`);
            const formats = await response.json();
            console.log('Fetched formats:', formats); // 调试输出
            Object.keys(formats).forEach(fmt => {
                const inputOption = document.createElement('option');
                inputOption.value = fmt;
                inputOption.textContent = fmt;
                inputFormatSelect.appendChild(inputOption);

                const outputOption = document.createElement('option');
                outputOption.value = fmt;
                outputOption.textContent = fmt;
                outputFormatSelect.appendChild(outputOption);
            });
            // 动画加载格式选项
            gsap.from([inputFormatSelect.children, outputFormatSelect.children], {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.5
            });
        } catch (error) {
            console.error('Failed to load formats:', error);
        }
    }

    // 文本转文件
    convertToFileBtn.addEventListener('click', async () => {
        const inputFormat = inputFormatSelect.value;
        const outputFormat = outputFormatSelect.value;
        const text = inputText.value;
        if (!inputFormat || !outputFormat || !text) return alert('Please select input/output formats and enter text');

        const formData = new FormData();
        const blob = new Blob([text], { type: 'text/plain' });
        formData.append('file', blob, `input.${inputFormat}`);

        try {
            const response = await fetch(`${API_BASE}convert?to=${outputFormat}`, {
                method: 'POST',
                body: formData
            });
            const blobResult = await response.blob();
            const url = window.URL.createObjectURL(blobResult);
            const a = document.createElement('a');
            a.href = url;
            a.download = `output.${outputFormat}`;
            a.click();
            window.URL.revokeObjectURL(url);
            animateButton(convertToFileBtn);
        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Conversion failed: ' + error.message);
        }
    });

    // 文本转 Raw Text
    convertToRawBtn.addEventListener('click', async () => {
        const inputFormat = inputFormatSelect.value;
        const outputFormat = outputFormatSelect.value;
        const text = inputText.value;
        if (!inputFormat || !outputFormat || !text) return alert('Please select input/output formats and enter text');

        const formData = new FormData();
        const blob = new Blob([text], { type: 'text/plain' });
        formData.append('file', blob, `input.${inputFormat}`);

        try {
            const response = await fetch(`${API_BASE}convert?to=${outputFormat}`, {
                method: 'POST',
                body: formData
            });
            const rawText = await response.text();
            showOutput(rawText);
            animateButton(convertToRawBtn);
        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Conversion failed: ' + error.message);
        }
    });

    // 文件转文件
    fileInput.addEventListener('change', async (e) => {
        const outputFormat = outputFormatSelect.value;
        const file = e.target.files[0];
        if (!outputFormat || !file) return alert('Please select an output format and upload a file');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}convert?to=${outputFormat}`, {
                method: 'POST',
                body: formData
            });
            const blobResult = await response.blob();
            const url = window.URL.createObjectURL(blobResult);
            const a = document.createElement('a');
            a.href = url;
            a.download = `output.${outputFormat}`;
            a.click();
            window.URL.revokeObjectURL(url);
            animateButton(fileInput);
        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Conversion failed: ' + error.message);
        }
    });

    // 文件转 Raw Text
    uploadToRawBtn.addEventListener('click', async () => {
        const outputFormat = outputFormatSelect.value;
        const file = fileInput.files[0];
        if (!outputFormat || !file) return alert('Please select an output format and upload a file');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}convert?to=${outputFormat}`, {
                method: 'POST',
                body: formData
            });
            const rawText = await response.text();
            showOutput(rawText);
            animateButton(uploadToRawBtn);
        } catch (error) {
            console.error('Conversion failed:', error);
            alert('Conversion failed: ' + error.message);
        }
    });

    // 显示输出
    function showOutput(text) {
        outputText.textContent = text;
        outputArea.classList.remove('hidden');
        gsap.from(outputArea, { opacity: 0, y: 50, duration: 0.5 });
    }

    // 按钮动画
    function animateButton(element) {
        gsap.to(element, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    }

    // 初始化
    loadFormats();
});