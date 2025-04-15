'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateOutlineSchema } from '@/lib/validations/book';
import { GenerateOutlineFormData, BookOutline } from '@/types/book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionGroup } from '@/components/ui/accordion';
import { Toggle } from '@/components/ui/toggle';
import { RadioGroup } from '@/components/ui/radio-group';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs';

const genreOptions = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'science-fiction', label: 'Science Fiction' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'historical-fiction', label: 'Historical Fiction' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'childrens', label: 'Children\'s' },
  { value: 'literary-fiction', label: 'Literary Fiction' },
  { value: 'crime', label: 'Crime' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'biography', label: 'Biography' },
  { value: 'memoir', label: 'Memoir' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'poetry', label: 'Poetry' },
];

type SubgenreOptions = {
  [key: string]: { value: string; label: string }[];
};

const subgenreOptions: SubgenreOptions = {
  'fantasy': [
    { value: 'high-fantasy', label: 'High Fantasy' },
    { value: 'urban-fantasy', label: 'Urban Fantasy' },
    { value: 'dark-fantasy', label: 'Dark Fantasy' },
    { value: 'epic-fantasy', label: 'Epic Fantasy' },
    { value: 'magical-realism', label: 'Magical Realism' },
  ],
  'science-fiction': [
    { value: 'space-opera', label: 'Space Opera' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
    { value: 'dystopian', label: 'Dystopian' },
    { value: 'hard-sci-fi', label: 'Hard Science Fiction' },
  ],
  'mystery': [
    { value: 'cozy-mystery', label: 'Cozy Mystery' },
    { value: 'detective', label: 'Detective' },
    { value: 'police-procedural', label: 'Police Procedural' },
    { value: 'whodunit', label: 'Whodunit' },
  ],
  'romance': [
    { value: 'contemporary-romance', label: 'Contemporary Romance' },
    { value: 'historical-romance', label: 'Historical Romance' },
    { value: 'paranormal-romance', label: 'Paranormal Romance' },
    { value: 'romantic-comedy', label: 'Romantic Comedy' },
  ],
  'thriller': [
    { value: 'psychological-thriller', label: 'Psychological Thriller' },
    { value: 'legal-thriller', label: 'Legal Thriller' },
    { value: 'political-thriller', label: 'Political Thriller' },
    { value: 'spy-thriller', label: 'Spy Thriller' },
  ],
  'horror': [
    { value: 'supernatural-horror', label: 'Supernatural Horror' },
    { value: 'psychological-horror', label: 'Psychological Horror' },
    { value: 'gothic-horror', label: 'Gothic Horror' },
    { value: 'cosmic-horror', label: 'Cosmic Horror' },
  ],
};

const toneOptions = [
  { value: 'serious', label: 'Serious', description: 'Thoughtful and profound' },
  { value: 'humorous', label: 'Humorous', description: 'Light-hearted and funny' },
  { value: 'dark', label: 'Dark', description: 'Grim and foreboding' },
  { value: 'inspirational', label: 'Inspirational', description: 'Uplifting and motivational' },
  { value: 'romantic', label: 'Romantic', description: 'Passionate and emotional' },
  { value: 'suspenseful', label: 'Suspenseful', description: 'Tense and thrilling' },
  { value: 'whimsical', label: 'Whimsical', description: 'Playful and fanciful' },
];

const audienceOptions = [
  { value: 'children', label: 'Children (Ages 5-8)' },
  { value: 'middle-grade', label: 'Middle Grade (Ages 9-12)' },
  { value: 'young-adult', label: 'Young Adult (Ages 13-18)' },
  { value: 'new-adult', label: 'New Adult (Ages 18-25)' },
  { value: 'adult', label: 'Adult (Ages 18+)' },
];

const complexityOptions = [
  { value: 'simple', label: 'Simple', description: 'Straightforward plot with minimal subplots' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced plot with some subplots and character development' },
  { value: 'complex', label: 'Complex', description: 'Intricate plot with multiple subplots and detailed character arcs' },
];

const writingStyleOptions = [
  { value: 'descriptive', label: 'Descriptive', description: 'Rich in sensory details and imagery' },
  { value: 'concise', label: 'Concise', description: 'Clear and to the point with minimal embellishment' },
  { value: 'lyrical', label: 'Lyrical', description: 'Poetic and flowing with beautiful language' },
  { value: 'conversational', label: 'Conversational', description: 'Casual and relatable, like talking to a friend' },
  { value: 'formal', label: 'Formal', description: 'Sophisticated and elegant with complex sentence structures' },
];

interface BookGeneratorFormProps {
  onOutlineGenerated: (outline: BookOutline) => void;
}

export function BookGeneratorForm({ onOutlineGenerated }: BookGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('fantasy');

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateOutlineFormData>({
    resolver: zodResolver(generateOutlineSchema),
    defaultValues: {
      topic: '',
      genre: 'fantasy',
      length: 5,
      complexity: 'moderate',
      includeCharacters: true,
    },
  });

  // Watch for genre changes to update subgenre options
  const genre = watch('genre');
  if (genre !== selectedGenre) {
    setSelectedGenre(genre);
  }

  const onSubmit = async (data: GenerateOutlineFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || 'Failed to generate book outline');
      }

      // Check if the response has the expected structure
      if (!responseData.title || !responseData.chapters || !Array.isArray(responseData.chapters)) {
        throw new Error('Invalid book outline format received from the API');
      }

      onOutlineGenerated(responseData);
    } catch (err) {
      console.error('Error generating book outline:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader
        title="Create Your Book"
        description="Enter details below to generate a book outline using AI"
      />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs>
            <TabList>
              <Tab isActive={activeTab === 0} onClick={() => setActiveTab(0)}>Basic</Tab>
              <Tab isActive={activeTab === 1} onClick={() => setActiveTab(1)}>Advanced</Tab>
              <Tab isActive={activeTab === 2} onClick={() => setActiveTab(2)}>Style</Tab>
            </TabList>

            {/* Basic Tab */}
            <TabPanel className={activeTab === 0 ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <Input
                  id="topic"
                  label="Book Topic"
                  placeholder="Enter a topic for your book"
                  helpText="What would you like your book to be about?"
                  {...register('topic')}
                  error={errors.topic?.message}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />

                <Select
                  id="genre"
                  label="Genre"
                  options={genreOptions}
                  helpText="Select the genre that best fits your book"
                  {...register('genre')}
                  error={errors.genre?.message}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                />

                {subgenreOptions[selectedGenre] && (
                  <Select
                    id="subgenre"
                    label="Subgenre"
                    options={subgenreOptions[selectedGenre]}
                    helpText="Specify a subgenre for more targeted results"
                    {...register('subgenre')}
                    error={errors.subgenre?.message}
                  />
                )}

                <Input
                  id="length"
                  label="Number of Chapters"
                  type="number"
                  min={1}
                  max={20}
                  helpText="Choose between 1-20 chapters"
                  {...register('length', { valueAsNumber: true })}
                  error={errors.length?.message}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </TabPanel>

            {/* Advanced Tab */}
            <TabPanel className={activeTab === 1 ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <Select
                  id="targetAudience"
                  label="Target Audience"
                  options={audienceOptions}
                  helpText="Who is your book intended for?"
                  {...register('targetAudience')}
                  error={errors.targetAudience?.message}
                />

                <Input
                  id="setting"
                  label="Setting"
                  placeholder="e.g., Medieval Europe, Futuristic Mars Colony"
                  helpText="Where and when does your story take place?"
                  {...register('setting')}
                  error={errors.setting?.message}
                />

                <Controller
                  name="complexity"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="complexity"
                      label="Plot Complexity"
                      options={complexityOptions}
                      value={field.value || 'moderate'}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="includeCharacters"
                  control={control}
                  render={({ field }) => (
                    <Toggle
                      label="Generate Characters"
                      description="Include detailed character profiles in the outline"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </div>
            </TabPanel>

            {/* Style Tab */}
            <TabPanel className={activeTab === 2 ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <Controller
                  name="tone"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="tone"
                      label="Tone/Mood"
                      options={toneOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="writingStyle"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      name="writingStyle"
                      label="Writing Style"
                      options={writingStyleOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </TabPanel>
          </Tabs>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{activeTab === 0 ? 'Basic' : activeTab === 1 ? 'Advanced' : 'Style'}</span> options selected
              </div>
              <Button
                type="submit"
                isLoading={isLoading}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                }
              >
                Generate Book Outline
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
