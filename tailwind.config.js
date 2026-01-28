/** @type {import('tailwindcss').Config} */
module.exports = {
    // 告诉 Tailwind 要扫描哪些文件来生成样式（必须配置，否则样式不生效）
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // 扫描 src 下所有 React 组件文件
        "./public/index.html" // 扫描入口 html 文件
    ],
    theme: {
        extend: {}, // 这里可以自定义 Tailwind 主题，暂时保持默认
    },
    plugins: [
        require("tailwindcss-animate") // 启用你安装的动画插件
    ],
};