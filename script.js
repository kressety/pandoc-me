document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'https://pandoc-api.mealuet.com/';
    const inputText = document.getElementById('inputText');
    const inputFormatSelect = document.getElementById('inputFormat');
    const outputFormatSelect = document.getElementById('outputFormat');
    const convertToFileBtn = document.getElementById('convertToFile');
    const convertToRawBtn = document.getElementById('convertToRaw');
    const fileInput = document.getElementById('fileInput');
    const uploadFileBtn = document.getElementById('uploadFile');
    const uploadOutputFormatSelect = document.getElementById('uploadOutputFormat');
    const outputArea = document.getElementById('outputArea');
    const outputText = document.getElementById('outputText');
    const fileNameDisplay = document.getElementById('fileName');
    const loading = document.getElementById('loading');
    const container = document.querySelector('.container');

    // 允许转换为纯文本的格式
    const allowedRawFormats = [
        'markdown', 'markdown_strict', 'markdown_phpextra', 'markdown_github', 'commonmark', 'gfm',
        'latex', 'html'
    ];

    // 获取支持的格式
    async function loadFormats() {
        try {
            const response = await fetch(`${API_BASE}formats`);
            const formats = await response.json();
            console.log('Fetched formats:', formats);
            Object.keys(formats).forEach(fmt => {
                const inputOption = document.createElement('option');
                inputOption.value = fmt;
                inputOption.textContent = fmt;
                inputFormatSelect.appendChild(inputOption);

                const outputOption = document.createElement('option');
                outputOption.value = fmt;
                outputOption.textContent = fmt;
                outputFormatSelect.appendChild(outputOption);

                const uploadOption = document.createElement('option');
                uploadOption.value = fmt;
                uploadOption.textContent = fmt;
                uploadOutputFormatSelect.appendChild(uploadOption);
            });
            gsap.from([inputFormatSelect.children, outputFormatSelect.children, uploadOutputFormatSelect.children], {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.5
            });
            // 隐藏加载界面，显示主界面
            gsap.to(loading, { opacity: 0, duration: 0.5, onComplete: () => loading.classList.add('hidden') });
            container.classList.remove('hidden');
            gsap.from(container, { opacity: 0, duration: 0.5 });
        } catch (error) {
            console.error('Failed to load formats:', error);
            alert('加载格式失败，请刷新重试');
        }
    }

    // 文本转文件
    convertToFileBtn.addEventListener('click', async () => {
        const inputFormat = inputFormatSelect.value;
        const outputFormat = outputFormatSelect.value;
        const text = inputText.value;
        if (!inputFormat || !outputFormat || !text) return alert('请选择输入/输出格式并输入文本');

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
            alert('转换失败：' + error.message);
        }
    });

    // 文本转 Raw Text
    convertToRawBtn.addEventListener('click', async () => {
        const inputFormat = inputFormatSelect.value;
        const outputFormat = outputFormatSelect.value;
        const text = inputText.value;
        if (!inputFormat || !outputFormat || !text) return alert('请选择输入/输出格式并输入文本');

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
            alert('转换失败：' + error.message);
        }
    });

    // 文件转文件
    uploadFileBtn.addEventListener('click', async () => {
        const outputFormat = uploadOutputFormatSelect.value;
        const file = fileInput.files[0];
        if (!outputFormat || !file) return alert('请选择输出格式并上传文件');

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
            animateButton(uploadFileBtn);
        } catch (error) {
            console.error('Conversion failed:', error);
            alert('转换失败：' + error.message);
        }
    });

    // 显示上传文件名并控制上传按钮状态
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
        uploadFileBtn.disabled = !uploadOutputFormatSelect.value || !fileInput.files[0];
    });

    // 动态控制“转换为纯文本”按钮状态
    outputFormatSelect.addEventListener('change', () => {
        const outputFormat = outputFormatSelect.value;
        convertToRawBtn.disabled = !allowedRawFormats.includes(outputFormat);
    });

    // 启用/禁用上传按钮
    uploadOutputFormatSelect.addEventListener('change', () => {
        uploadFileBtn.disabled = !uploadOutputFormatSelect.value || !fileInput.files[0];
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