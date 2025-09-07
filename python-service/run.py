from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🐍 Starting Python Analysis Service on port {port}")
    print(f"🔍 Debug mode: {debug}")
    print(f"🌐 CORS enabled for frontend connections")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )
