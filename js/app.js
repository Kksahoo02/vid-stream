// Google Drive API configuration
const GOOGLE_API_KEY = 'AIzaSyAL8zlqr-uDyRNfCRKYBcdF9ts7SA3BFhEconat';
const COURSES_FOLDER_ID = '1rXuiLbFmoARHPKsiw_f_b4Rb9tjlfWMW';

// Simulated course data (replace with actual API calls)
const courses = [
    {
        id: 'course1',
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
        thumbnail: 'https://via.placeholder.com/300x180',
        videoId: 'video1'
    },
    {
        id: 'course2',
        title: 'Advanced JavaScript Techniques',
        description: 'Master modern JavaScript patterns and practices.',
        thumbnail: 'https://via.placeholder.com/300x180',
        videoId: 'video2'
    },
    {
        id: 'course3',
        title: 'Responsive Web Design',
        description: 'Create websites that look great on any device.',
        thumbnail: 'https://via.placeholder.com/300x180',
        videoId: 'video3'
    }
];

// Video data mapping (this would come from Google Drive in production)
const videos = {
    'video1': {
        title: 'Introduction to Web Development',
        description: 'This comprehensive introduction covers the core concepts of web development including HTML structure, CSS styling, and JavaScript interactivity.',
        hlsUrl: 'https://your-server.com/videos/intro-web-dev/playlist.m3u8' // placeholder
    },
    'video2': {
        title: 'Advanced JavaScript Techniques',
        description: 'Dive deep into modern JavaScript with topics including closures, promises, async/await, and modular design patterns.',
        hlsUrl: 'https://your-server.com/videos/advanced-js/playlist.m3u8' // placeholder
    },
    'video3': {
        title: 'Responsive Web Design',
        description: 'Learn how to create fluid designs that adapt to any screen size using media queries, flexible grids, and responsive images.',
        hlsUrl: 'https://your-server.com/videos/responsive-design/playlist.m3u8' // placeholder
    }
};

// Load featured courses
function loadFeaturedCourses() {
    const container = document.getElementById('featured-courses-container');
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.dataset.id = course.id;
        courseCard.dataset.videoId = course.videoId;
        
        courseCard.innerHTML = `
            <img src="${course.thumbnail}" alt="${course.title}" class="course-thumbnail">
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <button class="btn-watch">Watch Now</button>
            </div>
        `;
        
        courseCard.addEventListener('click', () => loadCourseVideo(course.videoId));
        container.appendChild(courseCard);
    });
    
    // Initialize Adsterra ads
    initializeAds();
}

// Load and play course video
function loadCourseVideo(videoId) {
    const videoData = videos[videoId];
    if (!videoData) return;
    
    // Update video section
    document.getElementById('video-title').textContent = videoData.title;
    document.getElementById('video-description').textContent = videoData.description;
    document.getElementById('video-section').style.display = 'block';
    
    // Scroll to video section
    document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' });
    
    // Initialize HLS player
    const video = document.getElementById('video-player');
    
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoData.hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari, which has native HLS support
        video.src = videoData.hlsUrl;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    }
    
    // Load mid-roll ads
    loadMidrollAds();
}

// Actual Google Drive API integration function (simplified)
async function fetchCoursesFromGoogleDrive() {
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${COURSES_FOLDER_ID}' in parents`,
            fields: 'files(id, name, description, thumbnailLink, webContentLink)'
        });
        
        const files = response.result.files;
        // Process files and return structured course data
        return files.map(file => ({
            id: file.id,
            title: file.name,
            description: file.description || 'Course description.',
            thumbnail: file.thumbnailLink || 'https://via.placeholder.com/300x180',
            videoId: file.id
        }));
    } catch (error) {
        console.error('Error fetching courses from Google Drive:', error);
        return [];
    }
}

// Function to get HLS URL from Google Drive file
// This requires a server component to handle the conversion
async function getHlsUrlForGoogleDriveFile(fileId) {
    // In a real implementation, this would call your backend API
    // which would handle the authorization and conversion
    const apiUrl = `https://your-backend-api.com/get-hls-url?fileId=${fileId}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.hlsUrl;
    } catch (error) {
        console.error('Error getting HLS URL:', error);
        return null;
    }
}

// Initialize Google API client
function initializeGoogleApi() {
    gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    }).then(() => {
        console.log('Google API initialized');
        // After API is initialized, you can load courses from Google Drive
        // fetchCoursesFromGoogleDrive().then(loadCoursesFromData);
    });
}

// Adsterra integration
function initializeAds() {
    // Banner ad
    const bannerAdContainer = document.createElement('div');
    bannerAdContainer.className = 'ad-container';
    document.querySelector('main').prepend(bannerAdContainer);
    
    // Insert Adsterra banner code here
    const adsterraScript = document.createElement('script');
    adsterraScript.src = 'https://www.adsterra.com/yourBannerCode.js';
    bannerAdContainer.appendChild(adsterraScript);
}

// Load mid-roll ads for video
function loadMidrollAds() {
    // This would integrate with the video player to show ads at specific times
    // Typically, you would configure events on the video player timeline
    
    const video = document.getElementById('video-player');
    
    // Example: Show ad after 5 minutes of viewing
    video.addEventListener('timeupdate', () => {
        if (video.currentTime > 300 && !video.midrollShown) {
            video.midrollShown = true;
            video.pause();
            
            // Show ad overlay
            const adOverlay = document.createElement('div');
            adOverlay.className = 'ad-overlay';
            adOverlay.innerHTML = `
                <div class="ad-container">
                    <!-- Adsterra ad code would go here -->
                    <div id="adsterra-popup-placeholder"></div>
                    <button id="close-ad">Skip Ad in 5s</button>
                </div>
            `;
            
            document.querySelector('.video-wrapper').appendChild(adOverlay);
            
            // Insert Adsterra popup/interstitial code
            const popupScript = document.createElement('script');
            popupScript.src = 'https://www.adsterra.com/yourPopupCode.js';
            document.getElementById('adsterra-popup-placeholder').appendChild(popupScript);
            
            // Allow skipping after 5 seconds
            let countdown = 5;
            const closeButton = document.getElementById('close-ad');
            const countdownInterval = setInterval(() => {
                countdown--;
                closeButton.textContent = `Skip Ad in ${countdown}s`;
                
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    closeButton.textContent = 'Skip Ad';
                    closeButton.addEventListener('click', () => {
                        adOverlay.remove();
                        video.play();
                    });
                }
            }, 1000);
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedCourses();
    
    // Load Google API client
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
        gapi.load('client', initializeGoogleApi);
    };
    document.body.appendChild(script);
});