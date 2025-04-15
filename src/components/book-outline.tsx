'use client';

import { useState, useCallback } from 'react';
import { BookOutline, Chapter, Character } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import { downloadBookPDF } from '@/utils/pdf-generator';

interface BookOutlineProps {
  outline: BookOutline;
  onReset: () => void;
}

export function BookOutlineDisplay({ outline, onReset }: BookOutlineProps) {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [chapterContents, setChapterContents] = useState<{[key: number]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Outline, 1: Characters, 2: Details
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);



  const generateChapterContent = async (chapter: Chapter, isPartOfBatch = false) => {
    if (!isPartOfBatch) {
      setIsLoading(true);
      setError(null);
    }

    try {
      // Get character names if available
      const characterNames = outline.characters?.map(char => char.name) || [];

      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle: outline.title,
          chapterTitle: chapter.title,
          chapterSummary: chapter.summary,
          genre: outline.genre,
          tone: outline.tone,
          characters: characterNames,
          writingStyle: outline.writingStyle,
          detailLevel: 'standard',
        }),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || 'Failed to generate chapter content');
      }

      if (!responseData.content) {
        throw new Error('Invalid response format: missing content');
      }

      // Store the content in our chapter contents map
      setChapterContents(prev => ({
        ...prev,
        [chapter.chapterNumber]: responseData.content
      }));

      if (!isPartOfBatch) {
        setChapterContent(responseData.content);
        setSelectedChapter(chapter.chapterNumber);
      }

      return responseData.content;
    } catch (err) {
      console.error('Error generating chapter content:', err);
      if (!isPartOfBatch) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
      throw err;
    } finally {
      if (!isPartOfBatch) {
        setIsLoading(false);
      }
    }
  };

  // Function to generate all chapters sequentially
  const generateAllChapters = async () => {
    setIsGeneratingAll(true);
    setError(null);
    setGenerationProgress(0);

    const totalChapters = outline.chapters.length;
    let successCount = 0;

    try {
      for (let i = 0; i < totalChapters; i++) {
        const chapter = outline.chapters[i];
        setCurrentGeneratingChapter(chapter.chapterNumber);

        try {
          await generateChapterContent(chapter, true);
          successCount++;
        } catch (err) {
          console.error(`Failed to generate chapter ${chapter.chapterNumber}:`, err);
          // Continue with the next chapter even if this one fails
        }

        // Update progress
        setGenerationProgress(Math.round(((i + 1) / totalChapters) * 100));
      }

      if (successCount === 0) {
        setError('Failed to generate any chapters. Please try again.');
      } else if (successCount < totalChapters) {
        setError(`Generated ${successCount} out of ${totalChapters} chapters. Some chapters failed to generate.`);
      }
    } catch (err) {
      console.error('Error in batch generation:', err);
      setError('An error occurred during batch generation. Some chapters may not have been generated.');
    } finally {
      setIsGeneratingAll(false);
      setCurrentGeneratingChapter(null);
    }
  };

  // Function to handle PDF download
  const handleDownloadPdf = useCallback(async () => {
    setIsDownloadingPdf(true);
    try {
      // Check if we have content for all chapters
      const missingChapters = outline.chapters.filter(
        chapter => !chapterContents[chapter.chapterNumber]
      );

      // If there are missing chapters, generate them first
      if (missingChapters.length > 0) {
        if (window.confirm(`${missingChapters.length} chapter(s) haven't been generated yet. Would you like to generate them before downloading?`)) {
          await generateAllChapters();
        }
      }

      // Download the PDF
      downloadBookPDF(outline, chapterContents);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [outline, chapterContents]);

  return (
    <div className="space-y-8 animate-fade-in">
      <Card variant="elevated">
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{outline.title}</h2>
              <div className="flex space-x-2">
                {outline.subgenre && (
                  <Badge variant="secondary" size="md">{outline.subgenre}</Badge>
                )}
                <Badge variant="primary" size="md">{outline.genre}</Badge>
              </div>
            </div>
          }
        />
        <CardContent className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-800">
            <p className="italic text-indigo-700 dark:text-indigo-300">{outline.description}</p>
          </div>

          <Tabs>
            <TabList>
              <Tab isActive={activeTab === 0} onClick={() => setActiveTab(0)}>Chapters</Tab>
              {outline.characters && outline.characters.length > 0 && (
                <Tab isActive={activeTab === 1} onClick={() => setActiveTab(1)}>Characters</Tab>
              )}
              <Tab isActive={activeTab === 2} onClick={() => setActiveTab(2)}>Details</Tab>
            </TabList>

            {/* Chapters Tab */}
            <TabPanel className={activeTab === 0 ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mt-4 mb-6">
                <h3 className="text-lg font-medium flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {outline.chapters.length} Chapters
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateAllChapters}
                  isLoading={isGeneratingAll}
                  disabled={isGeneratingAll || isLoading}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  }
                >
                  Generate All Chapters
                </Button>
              </div>

              {isGeneratingAll && (
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">
                        Generating Chapter {currentGeneratingChapter} of {outline.chapters.length}
                      </span>
                    </div>
                    <span className="text-sm text-indigo-600 dark:text-indigo-400">{generationProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2.5">
                    <div className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {outline.chapters.map((chapter) => (
                  <Card
                    key={chapter.chapterNumber}
                    variant={selectedChapter === chapter.chapterNumber ? 'default' : 'outline'}
                    className={`transition-all duration-300 ${selectedChapter === chapter.chapterNumber ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700' : chapterContents[chapter.chapterNumber] ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700' : 'hover:border-gray-300 dark:hover:border-gray-600'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium flex items-center">
                            <Badge variant="outline" size="sm" className="mr-2">Ch {chapter.chapterNumber}</Badge>
                            {chapter.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">{chapter.summary}</p>

                          {chapter.keyEvents && chapter.keyEvents.length > 0 && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Events:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {chapter.keyEvents.map((event, idx) => (
                                  <li key={idx}>{event}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {chapterContents[chapter.chapterNumber] ? (
                          <>
                            {selectedChapter === chapter.chapterNumber ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedChapter(null)}
                                icon={
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                }
                              >
                                Hide Content
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setChapterContent(chapterContents[chapter.chapterNumber]);
                                  setSelectedChapter(chapter.chapterNumber);
                                }}
                                icon={
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                }
                              >
                                View Content
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateChapterContent(chapter)}
                              isLoading={isLoading && selectedChapter === null && !isGeneratingAll}
                              disabled={isGeneratingAll}
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              }
                            >
                              Regenerate
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => generateChapterContent(chapter)}
                            isLoading={(isLoading && selectedChapter === null && !isGeneratingAll) || (isGeneratingAll && currentGeneratingChapter === chapter.chapterNumber)}
                            disabled={isGeneratingAll && currentGeneratingChapter !== chapter.chapterNumber}
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            }
                          >
                            Generate Content
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabPanel>

            {/* Characters Tab */}
            <TabPanel className={activeTab === 1 ? 'block' : 'hidden'}>
              {outline.characters && outline.characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {outline.characters.map((character, idx) => (
                    <Card key={idx} variant="outline" className="h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-300 font-medium">{character.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium">{character.name}</h4>
                            <Badge variant={character.role === 'protagonist' ? 'primary' : character.role === 'antagonist' ? 'danger' : 'secondary'} size="sm" className="mt-1">
                              {character.role}
                            </Badge>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{character.description}</p>
                            {character.motivation && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Motivation:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{character.motivation}</p>
                              </div>
                            )}
                            {character.traits && character.traits.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {character.traits.map((trait, i) => (
                                  <Badge key={i} variant="outline" size="sm">{trait}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No character information available
                </div>
              )}
            </TabPanel>

            {/* Details Tab */}
            <TabPanel className={activeTab === 2 ? 'block' : 'hidden'}>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outline.targetAudience && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</h4>
                      <p className="text-gray-600 dark:text-gray-400">{outline.targetAudience}</p>
                    </div>
                  )}

                  {outline.tone && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone/Mood</h4>
                      <p className="text-gray-600 dark:text-gray-400">{outline.tone}</p>
                    </div>
                  )}

                  {outline.setting && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting</h4>
                      <p className="text-gray-600 dark:text-gray-400">{outline.setting}</p>
                    </div>
                  )}

                  {outline.timeframe && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe</h4>
                      <p className="text-gray-600 dark:text-gray-400">{outline.timeframe}</p>
                    </div>
                  )}
                </div>

                {outline.themes && outline.themes.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {outline.themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary" size="md">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onReset}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            Create New Book
          </Button>

          <Button
            variant="primary"
            onClick={handleDownloadPdf}
            isLoading={isDownloadingPdf}
            disabled={isGeneratingAll || Object.keys(chapterContents).length === 0}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Download as PDF
          </Button>
        </CardFooter>
      </Card>

      {selectedChapter !== null && chapterContent && (
        <Card variant="elevated" className="animate-fade-in">
          <CardHeader
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Chapter {selectedChapter}: {outline.chapters[selectedChapter - 1].title}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Navigate to previous chapter if available
                      if (selectedChapter > 1) {
                        const prevChapterNum = selectedChapter - 1;
                        if (chapterContents[prevChapterNum]) {
                          setChapterContent(chapterContents[prevChapterNum]);
                          setSelectedChapter(prevChapterNum);
                        }
                      }
                    }}
                    disabled={selectedChapter <= 1 || !chapterContents[selectedChapter - 1]}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Navigate to next chapter if available
                      if (selectedChapter < outline.chapters.length) {
                        const nextChapterNum = selectedChapter + 1;
                        if (chapterContents[nextChapterNum]) {
                          setChapterContent(chapterContents[nextChapterNum]);
                          setSelectedChapter(nextChapterNum);
                        }
                      }
                    }}
                    disabled={selectedChapter >= outline.chapters.length || !chapterContents[selectedChapter + 1]}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  />
                </div>
              </div>
            }
          />
          <CardContent>
            <div className="prose prose-indigo max-w-none dark:prose-invert">
              <ReactMarkdown>{chapterContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card variant="outline" className="border-red-200 dark:border-red-800 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-start text-red-700 dark:text-red-300">
              <svg className="w-5 h-5 mr-2 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
