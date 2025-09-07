#!/bin/bash

echo "🧬 Bioinformatics Data Management & Visualization Platform Setup"
echo "=============================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Check if Python is installed
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.8+ first."
    echo "Visit: https://python.org/"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_success "Python found: $PYTHON_VERSION"

# Check if MongoDB is installed
print_status "Checking MongoDB installation..."
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed or not in PATH."
    print_warning "Please install MongoDB Community Edition:"
    echo "Visit: https://docs.mongodb.com/manual/installation/"
    echo ""
    read -p "Continue setup without MongoDB check? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "MongoDB found"
fi

# Check if MongoDB is running
print_status "Checking if MongoDB is running..."
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB:"
    echo "   Windows: net start MongoDB"
    echo "   macOS: brew services start mongodb/brew/mongodb-community"
    echo "   Linux: sudo systemctl start mongod"
    echo ""
fi

echo ""
print_status "Starting installation process..."
echo ""

# Install Backend Dependencies
print_status "Installing Backend Dependencies..."
cd backend || { print_error "Backend directory not found!"; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bioinformatics
JWT_SECRET=your_super_secret_jwt_key_here_2024_$(date +%s)
NODE_ENV=development
PYTHON_SERVICE_URL=http://localhost:5001
EOF
    print_success ".env file created"
fi

npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install Frontend Dependencies
print_status "Installing Frontend Dependencies..."
cd ../frontend || { print_error "Frontend directory not found!"; exit 1; }

npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Setup Python Virtual Environment and Dependencies
print_status "Setting up Python Virtual Environment..."
cd ../python-service || { print_error "Python-service directory not found!"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

pip install --upgrade pip
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    print_success "Python dependencies installed"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Create upload directories
print_status "Creating necessary directories..."
mkdir -p temp_uploads
mkdir -p ../backend/uploads
print_success "Upload directories created"

# Return to project root
cd ..

echo ""
print_success "🎉 Setup Complete!"
echo ""
print_status "To start the application, run these commands in separate terminals:"
echo ""
echo "1. ${YELLOW}Backend Server:${NC}"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. ${YELLOW}Frontend Development Server:${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. ${YELLOW}Python Analysis Service:${NC}"
echo "   cd python-service"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "   venv\\Scripts\\activate"
else
    echo "   source venv/bin/activate"
fi
echo "   python run.py"
echo ""
echo "4. ${YELLOW}MongoDB (if not running):${NC}"
echo "   mongod"
echo ""
print_status "Access URLs:"
echo "   • Frontend: ${BLUE}http://localhost:5173${NC}"
echo "   • Backend API: ${BLUE}http://localhost:5000${NC}"
echo "   • Python Service: ${BLUE}http://localhost:5001${NC}"
echo ""
print_status "Sample datasets are available in the 'sample-data' directory"
echo ""
print_success "Happy coding! 🚀"
