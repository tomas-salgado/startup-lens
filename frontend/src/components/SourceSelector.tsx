'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from '../app/page.module.css';

export interface DataSource {
  id: string;
  name: string;
  icon: string;
}

const dataSources: DataSource[] = [
  { id: 'bigquery', name: 'Videos', icon: '/icons/bigquery.svg' },
  { id: 'snowflake', name: 'Paul Graham Essays', icon: '/icons/snowflake.svg' },
  { id: 'hubspot', name: 'HubSpot', icon: '/icons/hubspot.svg' },
  { id: 'redshift', name: 'RedshiftTTT', icon: '/icons/redshift.svg' },
  { id: 'salesforce', name: 'Salesforce', icon: '/icons/salesforce.svg' },
];

interface SourceSelectorProps {
  selectedSources: string[];
  onSourceChange: (sources: string[]) => void;
}

export default function SourceSelector({ selectedSources, onSourceChange }: SourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSource = (sourceId: string) => {
    const newSources = selectedSources.includes(sourceId)
      ? selectedSources.filter(id => id !== sourceId)
      : [...selectedSources, sourceId];
    onSourceChange(newSources);
  };

  // Get the first selected source for display
  const selectedSource = selectedSources.length > 0
    ? dataSources.find(source => source.id === selectedSources[0])
    : dataSources[0]; // Default to first source

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.sourceSelector}
        type="button"
        aria-label={selectedSource?.name}
      >
        <div className={styles.sourceSelectorIcon}>
          <Image
            src={selectedSource?.icon || dataSources[0].icon}
            alt={selectedSource?.name || dataSources[0].name}
            width={20}
            height={20}
          />
        </div>
      </button>

      {isOpen && (
        <div className={styles.sourceDropdown}>
          {dataSources.map((source) => (
            <div
              key={source.id}
              className={styles.sourceOption}
              onClick={() => {
                toggleSource(source.id);
                setIsOpen(false);
              }}
            >
              <div className={styles.sourceOptionIcon}>
                <Image
                  src={source.icon}
                  alt={source.name}
                  width={20}
                  height={20}
                />
              </div>
              <span className={styles.sourceOptionText}>{source.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 