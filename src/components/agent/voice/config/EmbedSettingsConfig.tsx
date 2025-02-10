import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import Input from '../../../lib/Input';

const EmbedSettingsConfig: React.FC = () => {
  const [domainUrl, setDomainUrl] = useState(''); // Only domain URL field
  const [embedCode, setEmbedCode] = useState('');

  // You could store or retrieve a default selectedAgentId here.
  // Alternatively, you could retrieve it when generating the code.
  // For demonstration, we'll retrieve it in handleGenerateEmbedCode.
  // const [selectedAgentId, setSelectedAgentId] = useState('');

  const handleGenerateEmbedCode = () => {
    // Retrieve selected agent ID from localStorage (or wherever it is stored)
    const selectedAgentId = localStorage.getItem('selectedAgentId') || '';

    // Generate a unique ID
    const uniqueId = uuidv4();

    // Construct the embed URL using domainUrl, uniqueId, and selectedAgentId
    const iframeUrl = `${domainUrl}/c?id=${uniqueId}?-${selectedAgentId}`;

    // Build the iframe HTML snippet
    const code = `<iframe src="${iframeUrl}" width="600" height="400"></iframe>`;

    setEmbedCode(code);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Embed Settings</h2>

      {/* Domain URL Field */}
      <div className="mb-4">
        <label htmlFor="domainUrl" className="block text-gray-700 font-medium mb-2">
          Domain URL
        </label>
        <Input
          type="text"
          id="domainUrl"
          value={domainUrl}
          onChange={(e) => setDomainUrl(e.target.value)}
          placeholder="Enter your domain URL"
        />
      </div>

      {/* Generate Embed Code Button */}
      <button
        onClick={handleGenerateEmbedCode}
        className="mb-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition duration-300"
      >
        Generate Embed Code
      </button>

      {/* Embed Code Section */}
      {embedCode && (
        <div className="mb-4">
          <label htmlFor="embedCode" className="block text-gray-700 font-medium mb-2">
            Embed Code
          </label>
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-md">
            <textarea
              id="embedCode"
              value={embedCode}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 focus:outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-r-md focus:outline-none"
            >
              <FaCopy />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedSettingsConfig;
