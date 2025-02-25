import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';

const API_BASE = 'https://pandoc-api.mealuet.com/';

function App() {
    const [formats, setFormats] = useState({});
    const [inputText, setInputText] = useState('');
    const [inputFormat, setInputFormat] = useState('markdown'); // 默认 Markdown
    const [outputFormat, setOutputFormat] = useState('');
    const [outputText, setOutputText] = useState('');
    const [showOutput, setShowOutput] = useState(false);
    const inputSelectRef = useRef(null);
    const outputSelectRef = useRef(null);

    // 获取支持的格式
    useEffect(() => {
        const fetchFormats = async () => {
            try {
                const response = await axios.get(`${API_BASE}formats`);
                setFormats(response.data);
                console.log('Fetched formats:', response.data);
            } catch (error) {
                console.error('Failed to load formats:', error);
            }
        };
        fetchFormats();
    }, []);

    // 输入格式选择框动画
    useEffect(() => {
        if (Object.keys(formats).length > 0 && inputSelectRef.current) {
            gsap.from(inputSelectRef.current.children, {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.5,
            });
        }
    }, [formats]);

    // 输出格式选择框动画
    useEffect(() => {
        if (Object.keys(formats).length > 0 && outputSelectRef.current) {
            gsap.from(outputSelectRef.current.children, {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.5,
            });
        }
    }, [formats]);

    // 文本转文件
    const convertTextToFile = async () => {
        if (!inputFormat || !outputFormat || !inputText) return alert('Please select input/output formats and enter text');
        const formData = new FormData();
        const blob = new Blob([inputText], { type: 'text/plain' });
        formData.append('file', blob, `input.${inputFormat}`);

        try {
            const response = await axios.post(`${API_BASE}convert?to=${outputFormat}`, formData, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `output.${outputFormat}`;
            a.click();
            window.URL.revokeObjectURL(url);
            animateButton('#convertToFile');
        } catch (error) {
            console.error('Conversion failed:', error.response?.data || error);
            alert('Conversion failed: ' + (error.response?.data || 'Unknown error'));
        }
    };

    // 文本转 Raw Text
    const convertTextToRaw = async () => {
        if (!inputFormat || !outputFormat || !inputText) return alert('Please select input/output formats and enter text');
        const formData = new FormData();
        const blob = new Blob([inputText], { type: 'text/plain' });
        formData.append('file', blob, `input.${inputFormat}`);

        try {
            const response = await axios.post(`${API_BASE}convert?to=${outputFormat}`, formData);
            setOutputText(response.data);
            setShowOutput(true);
            animateOutput();
            animateButton('#convertToRaw');
        } catch (error) {
            console.error('Conversion failed:', error.response?.data || error);
            alert('Conversion failed: ' + (error.response?.data || 'Unknown error'));
        }
    };

    // 文件转文件或 Raw Text
    const handleFileUpload = async (e, toRaw = false) => {
        const file = e.target.files[0];
        if (!outputFormat || !file) return alert('Please select an output format and upload a file');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE}convert?to=${outputFormat}`, formData, {
                responseType: toRaw ? 'text' : 'blob',
            });
            if (toRaw) {
                setOutputText(response.data);
                setShowOutput(true);
                animateOutput();
            } else {
                const url = window.URL.createObjectURL(response.data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `output.${outputFormat}`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
            animateButton('#fileInput');
        } catch (error) {
            console.error('Conversion failed:', error.response?.data || error);
            alert('Conversion failed: ' + (error.response?.data || 'Unknown error'));
        }
    };

    const animateButton = (selector) => {
        gsap.to(selector, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    };

    const animateOutput = () => {
        gsap.from('#outputArea', { opacity: 0, y: 50, duration: 0.5 });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass p-6 rounded-xl shadow-xl max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-center mb-6 animate-pulse">Pandoc Converter</h1>

                {/* 输入文本 */}
                <textarea
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                    rows="5"
                    placeholder="Enter your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />

                {/* 输入格式选择 */}
                <label className="block mb-2 text-sm">Input Format:</label>
                <select
                    ref={inputSelectRef}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                >
                    <option value="">Select Input Format</option>
                    {Object.keys(formats).map((fmt) => (
                        <option key={fmt} value={fmt} className="format-option">{fmt}</option>
                    ))}
                </select>

                {/* 输出格式选择 */}
                <label className="block mb-2 text-sm">Output Format:</label>
                <select
                    ref={outputSelectRef}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                >
                    <option value="">Select Output Format</option>
                    {Object.keys(formats).map((fmt) => (
                        <option key={fmt} value={fmt} className="format-option">{fmt}</option>
                    ))}
                </select>

                {/* 操作按钮 */}
                <div className="flex space-x-4 mb-6">
                    <button
                        id="convertToFile"
                        className="w-full py-2 px-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition-all"
                        onClick={convertTextToFile}
                    >
                        Convert to File
                    </button>
                    <button
                        id="convertToRaw"
                        className="w-full py-2 px-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                        onClick={convertTextToRaw}
                    >
                        Convert to Raw Text
                    </button>
                </div>

                {/* 文件上传 */}
                <label className="block mb-2 text-sm">Upload File:</label>
                <input
                    id="fileInput"
                    type="file"
                    className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-300 mb-6"
                    onChange={(e) => handleFileUpload(e, false)}
                />
                <button
                    className="w-full py-2 px-4 bg-green-600 rounded-lg hover:bg-green-700 transition-all"
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    Convert Uploaded File to Raw Text
                </button>

                {/* 输出区域 */}
                {showOutput && (
                    <div id="outputArea" className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">Output:</h2>
                        <pre className="whitespace-pre-wrap text-sm">{outputText}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;