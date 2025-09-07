# Bioinformatics Data Management & Visualization Platform

A comprehensive full-stack platform for researchers to upload, analyze, and visualize biological datasets including gene expression, microbiome, and protein data.

![Platform Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v16+-blue) ![Python](https://img.shields.io/badge/Python-v3.8+-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-green)

## 🚀 Features

- **🔐 User Management**: JWT-based authentication with role-based access (Researcher, Admin)
- **📊 Dataset Management**: Upload, store, and manage biological datasets (CSV/TSV)
- **📈 Data Visualization**: Interactive charts, heatmaps, and filters using Chart.js
- **🧬 Analysis Tools**: Statistical analysis, correlation matrices, and differential expression
- **🔬 Case Studies**: Demo with public datasets for research validation
- **📱 Responsive Design**: Works seamlessly across all devices

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** for fast development
- **Tailwind CSS** for responsive styling
- **Chart.js** + **React-Chartjs-2** for data visualization
- **Lucide React** for beautiful icons
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** + **Express.js** RESTful API
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **Multer** for file uploads
- **Helmet** + **Rate Limiting** for security

### Python Microservice
- **Flask** for statistical analysis API
- **Pandas** + **NumPy** for data processing
- **SciPy** for statistical computations
- **Scikit-learn** for machine learning analysis

### Database
- **MongoDB** for document storage
- **GridFS** for large file handling

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v4.4+)
- Git

### Quick Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd bioinformatics-platform
```

2. **Run the automated setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start the services** (in separate terminals)

```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run dev

# Terminal 4 - Python Service
cd python-service
source venv/bin/activate  # Linux/Mac
# OR venv\Scripts\activate  # Windows
python run.py
```

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Python Service Setup
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR venv\Scripts\activate  # Windows
pip install -r requirements.txt
python run.py
```

</details>

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Python Service**: http://localhost:5001
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Default Credentials

After setup, create an account or use these test credentials:
- **Email**: admin@example.com
- **Password**: admin123

## 📊 Sample Datasets

The platform includes sample datasets for testing:

- `sample-data/gene_expression.csv` - Gene expression data with control vs treatment groups
- `sample-data/microbiome_data.csv` - Microbiome diversity data for healthy vs disease samples

## 🏗 Project Architecture

```
bioinformatics-platform/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── services/           # API communication
│   │   └── utils/              # Helper functions
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
├── backend/                    # Node.js + Express backend
│   ├── controllers/            # Business logic
│   ├── models/                 # Database schemas
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Helper functions
│   └── uploads/                # File storage
├── python-service/             # Flask microservice
│   ├── app/                    # Application modules
│   ├── venv/                   # Virtual environment
│   └── requirements.txt        # Python dependencies
├── sample-data/                # Demo datasets
└── README.md                   # Documentation
```

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Datasets
- `GET /api/datasets` - Get all datasets
- `POST /api/datasets/upload` - Upload new dataset
- `GET /api/datasets/:id` - Get specific dataset
- `GET /api/datasets/:id/data` - Get dataset data
- `PUT /api/datasets/:id` - Update dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Analysis
- `POST /api/analysis/:datasetId/stats` - Basic statistics
- `POST /api/analysis/:datasetId/correlation` - Correlation analysis
- `POST /api/analysis/:datasetId/differential` - Differential expression
- `GET /api/analysis/:datasetId/history` - Analysis history

### Python Service
- `GET /api/health` - Service health check
- `POST /api/stats` - Statistical analysis
- `POST /api/correlation` - Correlation matrix
- `POST /api/differential` - Differential analysis

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev        # Development with nodemon
npm start          # Production server
npm test           # Run tests
```

### Python Service Development
```bash
cd python-service
source venv/bin/activate
python run.py      # Development server
pytest             # Run tests (if configured)
```

## 🧪 Testing

Upload the provided sample datasets to test the platform:

1. Go to **Datasets** → **Upload New**
2. Upload `gene_expression.csv` or `microbiome_data.csv`
3. Navigate to **Analysis** to run statistical tests
4. View results in **Visualization** section

## 📸 Screenshots & Features

### Dashboard
- Real-time statistics and data visualizations
- Quick access to recent datasets and analyses
- System health monitoring

### Dataset Management
- Drag-and-drop file upload interface
- Metadata management and organization
- Preview and download capabilities

### Data Visualization
- Interactive line charts, bar charts, and scatter plots
- Correlation heatmaps for gene expression analysis
- Customizable filters and data selection

### Statistical Analysis
- Basic statistics (mean, median, standard deviation)
- Pearson/Spearman correlation analysis
- Differential expression analysis with p-value filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Environment Variables

### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bioinformatics
JWT_SECRET=your_super_secret_jwt_key_here_2024
NODE_ENV=development
PYTHON_SERVICE_URL=http://localhost:5001
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`

2. **Python Service Not Starting**
   - Activate virtual environment: `source venv/bin/activate`
   - Install dependencies: `pip install -r requirements.txt`

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits (100MB max)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Use

This project was developed as a final year Computer Science Engineering project focused on bioinformatics data management and analysis. It demonstrates:

- Full-stack web development skills
- Database design and management
- API development and integration
- Data visualization techniques
- Statistical analysis implementation
- Scientific data processing

## 🙋‍♂️ Support

For support and questions:
- Create an issue in this repository
- Email: [your-email@example.com]
- Documentation: [Link to detailed docs if available]

## 🚀 Future Enhancements

- [ ] Docker containerization
- [ ] Advanced machine learning algorithms
- [ ] Real-time collaboration features
- [ ] Export to R/Python scripts
- [ ] Integration with public databases (NCBI, EBI)
- [ ] Advanced user permissions and sharing
- [ ] Automated report generation

---

**Built with ❤️ for the bioinformatics research community**

*Last updated: September 2025*