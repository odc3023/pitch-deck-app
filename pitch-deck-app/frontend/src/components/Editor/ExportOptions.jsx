import { useState } from 'react';
import { exportAPI } from '../../utils/api';
import { FiDownload, FiLoader, FiFileText, FiFile } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/**
 * ExportOptions Component
 * Provides options to export pitch deck in different formats (PDF, PowerPoint)
 * Handles file download and user feedback during export process
 */
const ExportOptions = ({ deck, slides }) => {
  const [exporting, setExporting] = useState(null);

  /**
   * Handles deck export in specified format
   * Validates deck availability and manages download process
   */
  const handleExport = async (format) => {
    if (!deck?.id) {
      toast.error('No deck selected for export');
      return;
    }

    setExporting(format);

    try {
      let response;
      let filename;
      let mimeType;

      if (format === 'pdf') {
        response = await exportAPI.toPDF(deck.id);
        filename = `${deck.title || 'pitch-deck'}.pdf`;
        mimeType = 'application/pdf';
      } else if (format === 'pptx') {
        response = await exportAPI.toPPTX(deck.id);
        filename = `${deck.title || 'pitch-deck'}.pptx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      }

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} exported successfully!`);

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || `Failed to export ${format.toUpperCase()}`;
      toast.error(errorMessage);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <FiDownload className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Export Your Pitch Deck
          </h3>
          <p className="text-sm text-gray-600">
            Download your presentation in professional formats
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        {/* PDF Export */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiFileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">PDF Export</h4>
                <p className="text-sm text-gray-600">
                  Professional format for sharing and presenting
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Slides + Speaker Notes • High Quality • Universal Format
                </div>
              </div>
            </div>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting === 'pdf'}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'pdf' ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* PowerPoint Export */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiFile className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">PowerPoint Export</h4>
                <p className="text-sm text-gray-600">
                  Editable format for Microsoft PowerPoint
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Fully Editable • Speaker Notes • Professional Templates
                </div>
              </div>
            </div>
            <button
              onClick={() => handleExport('pptx')}
              disabled={exporting === 'pptx'}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === 'pptx' ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4" />
                  Export PPTX
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Export Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>PDF:</strong> Best for final presentations and sharing with clients</li>
          <li>• <strong>PowerPoint:</strong> Best for further editing and collaboration</li>
          <li>• <strong>Speaker Notes:</strong> Automatically included in both formats</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportOptions;