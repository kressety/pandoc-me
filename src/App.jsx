import { useEffect, useState } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';

const API_BASE = 'https://pandoc-api.mealuet.com/';

function App() {
    const [formats, setFormats] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('');
    const [outputText, setOutputText] = useState('');
    const [showOutput, setShowOutput] = useState(false);

    // 获取支持的格式
    useEffect(() => {
        const fetchFormats = async () => {
            try {
                const response = await axios.get(`${API_BASE}formats`);
                const formatList = Object.keys(response.data);
                setFormats(formatList);
                gsap.from('.format-option', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 });
            } catch (error) {
                console.error('Failed to load formats:', error);
            }
        };
        fetchFormats();
    }, []);

    // 文本转文件
    const convertTextToFile = async () => {
        if (!selectedFormat || !inputText) return alert('Please select a format and enter text');
        const formData = new FormData();
        const blob = new Blob([inputText], { type: 'text/plain' });
        formData.append('file', blob, 'input.txt');

        try {
            const response = await axios.post(`${API_BASE}convert?to=${selectedFormat}`, formData, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `output.${selectedFormat}`;
            a.click();
            window.URL.revokeObjectURL(url);
            animateButton('#convertToFile');
        } catch (error) {
            console.error('Conversion failed:', error);
        }
    };

    // 文本转 Raw Text
    const convertTextToRaw = async () => {
        if (!selectedFormat || !inputText) return alert('Please select a format and enter text');
        const formData = new FormData();
        const blob = new Blob([inputText], { type: 'text/plain' });
        formData.append('file', blob, 'input.txt');

        try {
            const response = await axios.post(`${API_BASE}convert?to=${selectedFormat}`, formData);
            setOutputText(response.data);
            setShowOutput(true);
            animateOutput();
            animateButton('#convertToRaw');
        } catch (error) {
            console.error('Conversion failed:', error);
        }
    };

    // 文件转文件或 Raw Text
    const handleFileUpload = async (e, toRaw = false) => {
        const file = e.target.files[0];
        if (!selectedFormat || !file) return alert('Please select a format and upload a file');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE}convert?to=${selectedFormat}`, formData, {
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
                a.download = `output.${selectedFormat}`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
            animateButton('#fileInput');
        } catch (error) {
            console.error('Conversion failed:', error);
        }
    };

    // 动画函数
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

                {/* 格式选择 */}
                <select
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                >
                    <option value="">Select Output Format</option>
                    {formats.map((fmt) => (
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