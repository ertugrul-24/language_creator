import React, { useState, useRef } from 'react';

export interface Phoneme {
  symbol: string;
  ipa: string;
  audioUrl?: string;
}

export interface PhonemeSetInputProps {
  phonemes: Phoneme[];
  onChange: (phonemes: Phoneme[]) => void;
  error?: string;
}

/**
 * PhonemeSetInput - Dynamic phoneme input component
 * Allows users to add/edit/delete phonemes with IPA notation and optional audio
 */
export const PhonemeSetInput: React.FC<PhonemeSetInputProps> = ({
  phonemes = [],
  onChange,
  error,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPhoneme, setNewPhoneme] = useState<Phoneme>({ symbol: '', ipa: '' });
  const [uploadingAudio, setUploadingAudio] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Add new phoneme
  const handleAddPhoneme = () => {
    if (!newPhoneme.symbol.trim() || !newPhoneme.ipa.trim()) {
      return;
    }

    if (phonemes.some((p) => p.symbol === newPhoneme.symbol)) {
      alert('Phoneme symbol already exists');
      return;
    }

    onChange([...phonemes, newPhoneme]);
    setNewPhoneme({ symbol: '', ipa: '' });
    setIsAddingNew(false);
  };

  // Delete phoneme
  const handleDeletePhoneme = (index: number) => {
    onChange(phonemes.filter((_, i) => i !== index));
  };

  // Update phoneme
  const handleUpdatePhoneme = (index: number, field: keyof Phoneme, value: string) => {
    const updated = [...phonemes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Handle audio file upload
  const handleAudioUpload = async (index: number, file: File) => {
    if (!file) return;

    setUploadingAudio(phonemes[index].symbol);

    try {
      // For Phase 1, we'll simulate audio upload by creating a data URL
      // In production, this would upload to a cloud storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioUrl = e.target?.result as string;
        handleUpdatePhoneme(index, 'audioUrl', audioUrl);
        setUploadingAudio(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Audio upload error:', err);
      alert('Failed to upload audio file');
      setUploadingAudio(null);
    }
  };

  // Common IPA vowels and consonants for quick selection
  const commonIPAVowels = ['a', 'e', 'i', 'o', 'u', 'ə', 'ɔ', 'œ', 'ø', 'y', 'ɑ', 'ɪ', 'ʊ'];
  const commonIPAConsonants = ['p', 'b', 't', 'd', 'k', 'g', 'm', 'n', 'ŋ', 'f', 'v', 's', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'θ', 'ð'];

  return (
    <div className="space-y-4">
      {/* Phoneme List */}
      <div className="bg-background-dark border border-border-dark rounded-lg overflow-hidden">
        {phonemes.length === 0 ? (
          <div className="p-4 text-center text-text-secondary">
            <p className="text-sm">No phonemes added yet</p>
            <p className="text-xs mt-1">Add your first phoneme to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {phonemes.map((phoneme, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                  {/* Symbol */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Symbol</label>
                    <input
                      type="text"
                      value={phoneme.symbol}
                      onChange={(e) => handleUpdatePhoneme(index, 'symbol', e.target.value)}
                      placeholder="e.g., a, e, i"
                      maxLength={3}
                      className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* IPA */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">IPA Notation</label>
                    <input
                      type="text"
                      value={phoneme.ipa}
                      onChange={(e) => handleUpdatePhoneme(index, 'ipa', e.target.value)}
                      placeholder="e.g., [a], [ə]"
                      className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <p className="text-xs text-text-secondary mt-1">Use standard IPA notation</p>
                  </div>

                  {/* Audio Upload */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Audio (Optional)</label>
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[`audio-${index}`]?.click()}
                      disabled={uploadingAudio === phoneme.symbol}
                      className="w-full px-3 py-2 bg-surface-dark hover:bg-background-dark border border-border-dark rounded text-text-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
                    >
                      {uploadingAudio === phoneme.symbol ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                          Uploading...
                        </span>
                      ) : phoneme.audioUrl ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Uploaded
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-sm">upload_file</span>
                          Upload Audio
                        </span>
                      )}
                    </button>
                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current[`audio-${index}`] = el;
                      }}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAudioUpload(index, file);
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeletePhoneme(index)}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-700 rounded text-red-400 text-sm transition flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Phoneme Section */}
      {isAddingNew ? (
        <div className="bg-surface-dark border-2 border-blue-500/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Symbol</label>
              <input
                type="text"
                value={newPhoneme.symbol}
                onChange={(e) => setNewPhoneme({ ...newPhoneme, symbol: e.target.value })}
                placeholder="e.g., a, e, i"
                maxLength={3}
                autoFocus
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">IPA Notation</label>
              <input
                type="text"
                value={newPhoneme.ipa}
                onChange={(e) => setNewPhoneme({ ...newPhoneme, ipa: e.target.value })}
                placeholder="e.g., [a], [ə]"
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* IPA Quick Reference */}
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">Common IPA symbols:</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1">Vowels:</p>
                <div className="flex flex-wrap gap-1">
                  {commonIPAVowels.map((ipa) => (
                    <button
                      key={ipa}
                      type="button"
                      onClick={() => setNewPhoneme({ ...newPhoneme, ipa })}
                      className="px-2 py-1 text-xs bg-background-dark border border-border-dark rounded hover:border-blue-500 text-text-secondary hover:text-white transition"
                    >
                      {ipa}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary mb-1">Consonants:</p>
                <div className="flex flex-wrap gap-1">
                  {commonIPAConsonants.map((ipa) => (
                    <button
                      key={ipa}
                      type="button"
                      onClick={() => setNewPhoneme({ ...newPhoneme, ipa })}
                      className="px-2 py-1 text-xs bg-background-dark border border-border-dark rounded hover:border-blue-500 text-text-secondary hover:text-white transition"
                    >
                      {ipa}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleAddPhoneme}
              disabled={!newPhoneme.symbol.trim() || !newPhoneme.ipa.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded transition"
            >
              Add Phoneme
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setNewPhoneme({ symbol: '', ipa: '' });
              }}
              className="flex-1 px-3 py-2 bg-surface-dark border border-border-dark text-text-secondary hover:text-white text-sm font-medium rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-border-dark rounded-lg text-text-secondary hover:text-white hover:border-blue-500 transition flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Phoneme
        </button>
      )}

      {/* Error Display */}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-blue-400">💡 Tip:</span> Add at least 5 phonemes to create a realistic language.
          Use IPA notation for consistent pronunciation representation.
        </p>
      </div>
    </div>
  );
};
