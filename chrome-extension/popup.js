// popup.js - 弹出窗口逻辑

// 全局变量
let currentTemplate = 'classic';
let generatedImage = null;

// DOM元素
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const templateItems = document.querySelectorAll('.template-item');
const previewCanvas = document.getElementById('preview-canvas');
const previewPlaceholder = document.getElementById('preview-placeholder');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const summarizeBtn = document.getElementById('summarize-btn');

// 模板配置
const templates = {
    classic: {
        name: '经典文艺',
        backgroundColor: '#f9f7f7',
        textColor: '#333333',
        fontFamily: '"SimSun", serif',
        fontSize: 20,
        lineHeight: 1.6,
        padding: 100,
        border: true,
        borderRadius: 0
    },
    modern: {
        name: '简约现代',
        backgroundColor: '#f5f7fa',
        textColor: '#333333',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize: 18,
        lineHeight: 1.5,
        padding: 100,
        border: false,
        borderRadius: 0
    },
    warm: {
        name: '温暖治愈',
        backgroundColor: '#fff5e6',
        textColor: '#664433',
        fontFamily: '"Microsoft YaHei", sans-serif',
        fontSize: 19,
        lineHeight: 1.6,
        padding: 100,
        border: false,
        borderRadius: 16
    }
};

// 初始化
function init() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化预览
    updatePreview();
}

// 绑定事件监听器
function bindEventListeners() {
    // 文本输入事件
    textInput.addEventListener('input', handleTextInput);
    
    // 模板选择事件
    templateItems.forEach(item => {
        item.addEventListener('click', handleTemplateSelect);
    });
    
    // 生成图片按钮
    generateBtn.addEventListener('click', handleGenerateImage);
    
    // 下载按钮
    downloadBtn.addEventListener('click', handleDownload);
    
    // 复制到剪贴板按钮
    copyBtn.addEventListener('click', handleCopyToClipboard);
    
    // 总结按钮
    summarizeBtn.addEventListener('click', handleSummarize);
}

// 处理文本输入
function handleTextInput() {
    const text = textInput.value;
    const length = text.length;
    
    // 更新字数统计
    charCount.textContent = `${length}/500`;
    
    // 更新预览
    updatePreview();
}

// 处理模板选择
function handleTemplateSelect(e) {
    const templateItem = e.currentTarget;
    const template = templateItem.dataset.template;
    
    // 更新选中状态
    templateItems.forEach(item => item.classList.remove('active'));
    templateItem.classList.add('active');
    
    // 更新当前模板
    currentTemplate = template;
    
    // 更新预览
    updatePreview();
}

// 更新预览
function updatePreview() {
    const text = textInput.value.trim();
    const ctx = previewCanvas.getContext('2d');
    
    if (!text) {
        // 显示占位符
        previewCanvas.style.display = 'none';
        previewPlaceholder.style.display = 'block';
        return;
    }
    
    // 隐藏占位符，显示预览
    previewCanvas.style.display = 'block';
    previewPlaceholder.style.display = 'none';
    
    // 获取当前模板配置
    const template = templates[currentTemplate];
    
    // 清空画布
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // 绘制背景
    ctx.fillStyle = template.backgroundColor;
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // 设置文本样式
    ctx.fillStyle = template.textColor;
    ctx.font = `${template.fontSize * 0.5}px ${template.fontFamily}`;
    ctx.textAlign = 'center';
    
    // 计算文本布局
    const maxWidth = previewCanvas.width - 40;
    const lineHeight = template.lineHeight * template.fontSize * 0.5;
    const x = previewCanvas.width / 2;
    let y = 40;
    
    // 分段渲染文本
    const lines = wrapText(text, ctx, maxWidth);
    lines.forEach(line => {
        ctx.fillText(line, x, y);
        y += lineHeight;
    });
}

// 文本换行处理
function wrapText(text, ctx, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    
    return lines;
}

// 生成图片
function generateImage() {
    const text = textInput.value.trim();
    if (!text) {
        alert('请输入文字内容');
        return null;
    }
    
    // 获取当前模板配置
    const template = templates[currentTemplate];
    
    // 计算画布尺寸
    const canvasWidth = 600;
    const padding = template.padding;
    const contentWidth = canvasWidth - padding * 2;
    
    // 创建临时画布用于计算高度
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `${template.fontSize}px ${template.fontFamily}`;
    
    // 计算文本行数
    const lines = wrapText(text, tempCtx, contentWidth);
    const lineHeight = template.lineHeight * template.fontSize;
    const contentHeight = lines.length * lineHeight;
    const canvasHeight = Math.max(800, Math.min(2000, contentHeight + padding * 2));
    
    // 创建最终画布
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = template.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制边框
    if (template.border) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
    }
    
    // 设置文本样式
    ctx.fillStyle = template.textColor;
    ctx.font = `${template.fontSize}px ${template.fontFamily}`;
    ctx.textAlign = 'center';
    
    // 渲染文本
    let y = padding;
    lines.forEach(line => {
        ctx.fillText(line, canvasWidth / 2, y);
        y += lineHeight;
    });
    
    return canvas;
}

// 处理生成图片
function handleGenerateImage() {
    const canvas = generateImage();
    if (canvas) {
        // 保存生成的图片
        generatedImage = canvas;
        
        // 更新按钮状态
        downloadBtn.disabled = false;
        copyBtn.disabled = false;
        
        // 更新预览
        updatePreviewWithGeneratedImage(canvas);
        
        // 显示成功提示
        alert('图片生成成功！');
    }
}

// 使用生成的图片更新预览
function updatePreviewWithGeneratedImage(canvas) {
    const ctx = previewCanvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // 绘制生成的图片（缩小版）
    ctx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
    
    // 显示预览
    previewCanvas.style.display = 'block';
    previewPlaceholder.style.display = 'none';
}

// 处理下载
function handleDownload() {
    if (!generatedImage) return;
    
    // 转换为DataURL
    const dataURL = generatedImage.toDataURL('image/png');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    
    // 生成文件名
    const date = new Date();
    const fileName = `金句_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.png`;
    
    link.download = fileName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示成功提示
    alert('图片下载成功！');
}

// 处理复制到剪贴板
function handleCopyToClipboard() {
    if (!generatedImage) return;
    
    // 转换为DataURL
    const dataURL = generatedImage.toDataURL('image/png');
    
    // 创建Image对象
    const img = new Image();
    img.src = dataURL;
    
    img.onload = function() {
        // 使用Canvas API复制到剪贴板
        navigator.clipboard.write([
            new ClipboardItem({
                'image/png': fetch(dataURL).then(r => r.blob())
            })
        ]).then(() => {
            alert('图片已复制到剪贴板！');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请重试');
        });
    };
}

// 初始化
init();

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 处理总结按钮点击
function handleSummarize() {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('请先输入需要总结的文本内容');
        return;
    }
    
    // 禁用按钮并显示加载状态
    summarizeBtn.disabled = true;
    summarizeBtn.textContent = '生成中...';
    
    // 向本地服务器发送总结请求
    fetch('http://localhost:3000/api/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('总结请求失败');
        }
        
        // 处理流式响应
        const reader = response.body.getReader();
        let summary = '';
        
        function processText({ done, value }) {
            if (done) {
                // 总结完成
                if (summary) {
                    // 将总结结果显示在输入框中
                    textInput.value = summary.trim();
                    // 更新字数统计
                    const length = summary.length;
                    charCount.textContent = `${length}/500`;
                    // 更新预览
                    updatePreview();
                    // 显示成功提示
                    alert('总结生成成功！');
                } else {
                    alert('总结失败，请重试');
                }
                
                // 恢复按钮状态
                summarizeBtn.disabled = false;
                summarizeBtn.textContent = 'DeepSeek R1 总结';
                
                return;
            }
            
            // 处理新的文本块
            const chunk = new TextDecoder('utf-8').decode(value);
            summary += chunk;
            
            // 继续读取
            return reader.read().then(processText);
        }
        
        return reader.read().then(processText);
    })
    .catch(error => {
        console.error('总结错误:', error);
        alert('总结失败，请检查服务器是否运行并重试');
        
        // 恢复按钮状态
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'DeepSeek R1 总结';
    });
}

// 优化预览更新性能
const debouncedUpdatePreview = debounce(updatePreview, 300);

// 重新绑定文本输入事件以使用防抖
textInput.removeEventListener('input', handleTextInput);
textInput.addEventListener('input', function() {
    const text = textInput.value;
    const length = text.length;
    charCount.textContent = `${length}/500`;
    debouncedUpdatePreview();
});