from flask import Blueprint, request, jsonify
from app.analysis import AnalysisService
import traceback

bp = Blueprint('api', __name__)
analysis_service = AnalysisService()

@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Python analysis service is running',
        'service': 'bioinformatics-python-service'
    })

@bp.route('/stats', methods=['POST'])
def basic_stats():
    """Calculate basic statistics for dataset"""
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        columns = data.get('columns', [])
        
        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            }), 400
        
        # Perform statistical analysis
        results = analysis_service.calculate_basic_stats(file_path, columns)
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Statistical analysis completed successfully'
        })
        
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Dataset file not found'
        }), 404
        
    except Exception as e:
        print(f"Error in basic_stats: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@bp.route('/correlation', methods=['POST'])
def correlation_analysis():
    """Calculate correlation matrix"""
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        method = data.get('method', 'pearson')
        
        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            }), 400
        
        # Perform correlation analysis
        results = analysis_service.calculate_correlation(file_path, method)
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Correlation analysis completed successfully'
        })
        
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Dataset file not found'
        }), 404
        
    except Exception as e:
        print(f"Error in correlation_analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@bp.route('/differential', methods=['POST'])
def differential_analysis():
    """Perform differential expression analysis"""
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        condition1 = data.get('condition1')
        condition2 = data.get('condition2')
        p_value_threshold = data.get('pValueThreshold', 0.05)
        
        if not all([file_path, condition1, condition2]):
            return jsonify({
                'success': False,
                'message': 'File path, condition1, and condition2 are required'
            }), 400
        
        # Perform differential analysis
        results = analysis_service.differential_analysis(
            file_path, condition1, condition2, p_value_threshold
        )
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Differential analysis completed successfully'
        })
        
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Dataset file not found'
        }), 404
        
    except Exception as e:
        print(f"Error in differential_analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@bp.route('/clustering', methods=['POST'])
def clustering_analysis():
    """Perform clustering analysis"""
    try:
        data = request.get_json()
        file_path = data.get('filePath')
        n_clusters = data.get('nClusters', 3)
        method = data.get('method', 'kmeans')
        
        if not file_path:
            return jsonify({
                'success': False,
                'message': 'File path is required'
            }), 400
        
        # Perform clustering analysis
        results = analysis_service.clustering_analysis(file_path, n_clusters, method)
        
        return jsonify({
            'success': True,
            'data': results,
            'message': 'Clustering analysis completed successfully'
        })
        
    except FileNotFoundError:
        return jsonify({
            'success': False,
            'message': 'Dataset file not found'
        }), 404
        
    except Exception as e:
        print(f"Error in clustering_analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

# Error handlers
@bp.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'message': 'File too large. Maximum size is 100MB.'
    }), 413

@bp.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'message': 'Internal server error occurred'
    }), 500
