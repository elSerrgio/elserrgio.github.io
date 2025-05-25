// Website configuration - Change the site name here
const SITE_CONFIG = {
    name: "AudioScribe",
    title: "AudioScribe - Professional Audio Transcription"
};

// Global variable to store transcription
let transcriptionText = "";

// File upload handling
const fileInput = document.getElementById("fileInput");
const fileUploadArea = document.getElementById("fileUploadArea");
const fileInfo = document.getElementById("fileInfo");

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSiteName();
    initializeFileUpload();
    initializeTranscription();
    initializeResultActions();
    initializeFAQ();
});

// Initialize site name throughout the website
function initializeSiteName() {
    // Update page title
    document.getElementById('site-title').textContent = SITE_CONFIG.title;
    
    // Update navigation logo
    document.getElementById('nav-logo-text').textContent = SITE_CONFIG.name;
    
    // Update main logo
    document.getElementById('main-logo').textContent = SITE_CONFIG.name;
    
    // Update features section
    document.getElementById('features-site-name').textContent = SITE_CONFIG.name;
    
    // Update FAQ section
    document.getElementById('faq-site-name-1').textContent = SITE_CONFIG.name;
    
    // Update footer
    document.getElementById('footer-site-name').textContent = SITE_CONFIG.name;
    document.getElementById('footer-copyright-name').textContent = SITE_CONFIG.name;
}

// FAQ functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Hide all answers initially
    document.querySelectorAll('.faq-answer').forEach(answer => {
        answer.style.display = 'none';
    });
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqId = this.getAttribute('data-faq');
            const answer = document.getElementById(`faq-${faqId}`);
            
            if (answer.style.display === 'none' || answer.style.display === '') {
                answer.style.display = 'block';
                answer.style.animation = 'fadeInUp 0.3s ease';
                this.classList.add('active');
            } else {
                answer.style.display = 'none';
                this.classList.remove('active');
            }
        });
    });
}

// File Upload Functions
function initializeFileUpload() {
    fileUploadArea.addEventListener('click', () => fileInput.click());
    
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            showFileInfo(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            showFileInfo(e.target.files[0]);
        }
    });
}

function showFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    fileInfo.classList.add('show');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Transcription Functions
function initializeTranscription() {
    document.getElementById("transcribeButton").addEventListener('click', transcribeAudio);
}

async function transcribeAudio() {
    let file = fileInput.files[0];
    const language = document.getElementById("languageSelect").value;

    if (!file) {
        showError("Please select an audio file.");
        return;
    }

    // Show loading state
    const button = document.getElementById("transcribeButton");
    button.classList.add('loading');
    button.disabled = true;
    
    // Hide previous results and errors
    document.getElementById("resultSection").classList.remove('show');
    document.getElementById("errorMessage").classList.remove('show');

    let formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
        let response = await fetch("https://elserrgio-transcribe-audio.hf.space/transcribe/", {
        //let response = await fetch("http://127.0.0.1:8000/transcribe/", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            let data = await response.json();
            transcriptionText = data.transcription;
            
            if (transcriptionText) {
                displayTranscription();
                document.getElementById("resultSection").classList.add('show');
            } else {
                showError("No transcription available.");
            }
        } else {
            showError(`Transcription failed with status: ${response.status}`);
        }

    } catch (error) {
        console.error("Error:", error);
        showError("Oops, an error occurred! Please try again.");
    } finally {
        // Remove loading state
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function displayTranscription() {
    const resultDiv = document.getElementById("transcribeResult");
    resultDiv.textContent = transcriptionText;
}

function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Result Action Functions
function initializeResultActions() {
    // Download functionality
    document.getElementById("downloadButton").addEventListener('click', function() {
        if (!transcriptionText) {
            showError("Nothing to download. Please transcribe first.");
            return;
        }

        const blob = new Blob([transcriptionText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "transcription.txt";
        a.click();

        URL.revokeObjectURL(url);
    });

    // Copy functionality
    document.getElementById("copyButton").addEventListener('click', async function() {
        if (!transcriptionText) {
            showError("Nothing to copy. Please transcribe first.");
            return;
        }

        try {
            await navigator.clipboard.writeText(transcriptionText);
            const button = document.getElementById("copyButton");
            const originalText = button.textContent;
            button.textContent = "Copied!";
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showError("Failed to copy text to clipboard.");
        }
    });
}

// Smooth scrolling for navigation links (fallback for older browsers)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});