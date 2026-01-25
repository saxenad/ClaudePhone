// West Loop Construction Tracker - Main Application

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const projectsContainer = document.getElementById('projects-container');
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('close-modal');

    // Stats elements
    const totalProjectsEl = document.getElementById('total-projects');
    const underConstructionEl = document.getElementById('under-construction');
    const proposedEl = document.getElementById('proposed');
    const completedEl = document.getElementById('completed-2024');

    // Map variables
    let map;
    let markers = [];
    let markerLayer;

    // Initialize the application
    init();

    function init() {
        updateStats();
        renderProjects(constructionProjects);
        initMap();
        setupEventListeners();
    }

    // Initialize the Leaflet map
    function initMap() {
        // Center on West Loop, Chicago
        const westLoopCenter = [41.8825, -87.6550];

        map = L.map('map').setView(westLoopCenter, 14);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Create a layer group for markers
        markerLayer = L.layerGroup().addTo(map);

        // Add markers for all projects
        addMarkersToMap(constructionProjects);
    }

    // Add markers to the map
    function addMarkersToMap(projects) {
        // Clear existing markers
        markerLayer.clearLayers();
        markers = [];

        projects.forEach(project => {
            if (project.lat && project.lng) {
                const marker = createMarker(project);
                markers.push({ marker, projectId: project.id });
                marker.addTo(markerLayer);
            }
        });

        // Fit map bounds to show all markers if there are any
        if (markers.length > 0) {
            const group = L.featureGroup(markers.map(m => m.marker));
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Create a custom marker with popup
    function createMarker(project) {
        const statusColors = {
            'under-construction': '#f59e0b',
            'proposed': '#3b82f6',
            'approved': '#8b5cf6',
            'completed': '#10b981'
        };

        const color = statusColors[project.status] || '#6b7280';

        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([project.lat, project.lng], { icon });

        // Create popup content
        const statusText = formatStatus(project.status);
        const statusBgColors = {
            'under-construction': '#fef3c7',
            'proposed': '#dbeafe',
            'approved': '#e0e7ff',
            'completed': '#d1fae5'
        };
        const statusTextColors = {
            'under-construction': '#92400e',
            'proposed': '#1e40af',
            'approved': '#3730a3',
            'completed': '#065f46'
        };

        const popupContent = `
            <div class="popup-content">
                <h3>${project.name}</h3>
                <p>${project.address}</p>
                <span class="popup-status" style="
                    background: ${statusBgColors[project.status]};
                    color: ${statusTextColors[project.status]};
                ">${statusText}</span>
                <br>
                <a class="popup-link" onclick="window.openProjectModal(${project.id})">View Details</a>
            </div>
        `;

        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 250
        });

        return marker;
    }

    // Expose openModal globally for popup links
    window.openProjectModal = function(projectId) {
        openModal(projectId);
    };

    // Update statistics
    function updateStats() {
        const total = constructionProjects.length;
        const underConstruction = constructionProjects.filter(p => p.status === 'under-construction').length;
        const proposed = constructionProjects.filter(p => p.status === 'proposed').length;
        const completed = constructionProjects.filter(p => p.status === 'completed').length;

        animateCounter(totalProjectsEl, total);
        animateCounter(underConstructionEl, underConstruction);
        animateCounter(proposedEl, proposed);
        animateCounter(completedEl, completed);
    }

    // Animate counter numbers
    function animateCounter(element, target) {
        let current = 0;
        const increment = Math.ceil(target / 20);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 50);
    }

    // Render project cards
    function renderProjects(projects) {
        if (projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No projects found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        projectsContainer.innerHTML = projects.map(project => createProjectCard(project)).join('');

        // Add click listeners to cards
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = parseInt(card.dataset.id);
                openModal(projectId);
            });
        });
    }

    // Create a project card HTML
    function createProjectCard(project) {
        const statusClass = `status-${project.status}`;
        const statusText = formatStatus(project.status);
        const icon = getProjectIcon(project.type);

        return `
            <article class="project-card" data-id="${project.id}">
                <div class="project-image">${icon}</div>
                <div class="project-content">
                    <div class="project-header">
                        <div>
                            <h2 class="project-name">${project.name}</h2>
                            <p class="project-address">${project.address}</p>
                        </div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="project-details">
                        <div class="detail-item">
                            <span class="detail-label">Type</span>
                            <span class="detail-value">${formatType(project.type)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Floors</span>
                            <span class="detail-value">${project.floors}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">${project.type === 'hotel' ? 'Rooms' : 'Units'}</span>
                            <span class="detail-value">${project.hotelRooms || project.units || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Completion</span>
                            <span class="detail-value">${formatDate(project.expectedCompletion)}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    // Open modal with project details
    function openModal(projectId) {
        const project = constructionProjects.find(p => p.id === projectId);
        if (!project) return;

        const icon = getProjectIcon(project.type);
        const statusClass = `status-${project.status}`;
        const statusText = formatStatus(project.status);

        modalBody.innerHTML = `
            <div class="modal-image">${icon}</div>
            <div class="modal-details">
                <div class="project-header">
                    <div>
                        <h2 class="modal-title">${project.name}</h2>
                        <p class="modal-address">${project.address}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>

                <div class="modal-section">
                    <h3>Project Details</h3>
                    <div class="modal-grid">
                        <div class="modal-item">
                            <span class="modal-item-label">Developer</span>
                            <span class="modal-item-value">${project.developer}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Architect</span>
                            <span class="modal-item-value">${project.architect}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Type</span>
                            <span class="modal-item-value">${formatType(project.type)}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Floors</span>
                            <span class="modal-item-value">${project.floors}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">${project.type === 'hotel' ? 'Hotel Rooms' : 'Residential Units'}</span>
                            <span class="modal-item-value">${project.hotelRooms || project.units || 'N/A'}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Estimated Cost</span>
                            <span class="modal-item-value">${project.estimatedCost}</span>
                        </div>
                        ${project.retailSqFt ? `
                        <div class="modal-item">
                            <span class="modal-item-label">Retail Space</span>
                            <span class="modal-item-value">${project.retailSqFt.toLocaleString()} sq ft</span>
                        </div>
                        ` : ''}
                        ${project.officeSqFt ? `
                        <div class="modal-item">
                            <span class="modal-item-label">Office Space</span>
                            <span class="modal-item-value">${project.officeSqFt.toLocaleString()} sq ft</span>
                        </div>
                        ` : ''}
                        <div class="modal-item">
                            <span class="modal-item-label">Neighborhood</span>
                            <span class="modal-item-value">${project.neighborhood}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Expected Completion</span>
                            <span class="modal-item-value">${formatDate(project.expectedCompletion)}</span>
                        </div>
                    </div>
                </div>

                <div class="modal-section">
                    <h3>Description</h3>
                    <p class="modal-description">${project.description}</p>
                </div>

                ${project.features && project.features.length > 0 ? `
                <div class="modal-section">
                    <h3>Features & Amenities</h3>
                    <div class="modal-grid">
                        ${project.features.map(f => `
                            <div class="modal-item">
                                <span class="modal-item-value">${f}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="modal-section">
                    <h3>Timeline</h3>
                    <div class="modal-grid">
                        <div class="modal-item">
                            <span class="modal-item-label">Construction Start</span>
                            <span class="modal-item-value">${project.startDate ? formatDate(project.startDate) : 'TBD'}</span>
                        </div>
                        <div class="modal-item">
                            <span class="modal-item-label">Expected Completion</span>
                            <span class="modal-item-value">${formatDate(project.expectedCompletion)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close modal
    function closeModalHandler() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Filter listeners
        statusFilter.addEventListener('change', filterProjects);
        typeFilter.addEventListener('change', filterProjects);
        searchInput.addEventListener('input', debounce(filterProjects, 300));

        // Modal listeners
        closeModal.addEventListener('click', closeModalHandler);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });

        // Keyboard listener for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModalHandler();
            }
        });
    }

    // Filter projects based on current filter values
    function filterProjects() {
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;
        const searchValue = searchInput.value.toLowerCase().trim();

        let filtered = constructionProjects;

        // Filter by status
        if (statusValue !== 'all') {
            filtered = filtered.filter(p => p.status === statusValue);
        }

        // Filter by type
        if (typeValue !== 'all') {
            filtered = filtered.filter(p => p.type === typeValue);
        }

        // Filter by search
        if (searchValue) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchValue) ||
                p.address.toLowerCase().includes(searchValue) ||
                p.developer.toLowerCase().includes(searchValue) ||
                p.architect.toLowerCase().includes(searchValue) ||
                p.neighborhood.toLowerCase().includes(searchValue)
            );
        }

        renderProjects(filtered);

        // Update map markers based on filtered projects
        addMarkersToMap(filtered);
    }

    // Utility functions
    function formatStatus(status) {
        const statusMap = {
            'under-construction': 'Under Construction',
            'proposed': 'Proposed',
            'approved': 'Approved',
            'completed': 'Completed'
        };
        return statusMap[status] || status;
    }

    function formatType(type) {
        const typeMap = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'mixed-use': 'Mixed-Use',
            'hotel': 'Hotel'
        };
        return typeMap[type] || type;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'TBD';
        const [year, month] = dateStr.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${year}`;
    }

    function getProjectIcon(type) {
        const icons = {
            'residential': '\u{1F3E2}',
            'commercial': '\u{1F3E2}',
            'mixed-use': '\u{1F3D7}',
            'hotel': '\u{1F3E8}'
        };
        return icons[type] || '\u{1F3D7}';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
