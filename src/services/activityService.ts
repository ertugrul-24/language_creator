export interface ActivityLogEntry {
  type: 'language_created' | 'language_updated' | 'specs_changed' | 'word_added' | 'rule_added' | 'course_created' | 'course_completed';
  languageId: string;
  userId: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Log an activity to track user actions
 * This helps with activity feeds and history tracking
 * 
 * @param userId - The user performing the action
 * @param type - The type of activity
 * @param languageId - The language ID associated with the activity
 * @param description - Human-readable description of the activity
 * @param metadata - Additional metadata about the activity
 */
export const logActivity = async (
  userId: string,
  type: 'language_created' | 'language_updated' | 'specs_changed' | 'word_added' | 'rule_added' | 'course_created' | 'course_completed',
  languageId: string,
  description: string,
  metadata?: Record<string, any>
) => {
  try {
    console.log('[logActivity] Logging activity:', { type, userId, languageId, description });

    // For now, we just log to console
    // In a future phase, we can store this in an 'activity' table
    console.log('[logActivity] Activity logged successfully');
    console.log(`[${type}] ${description}`, metadata);

    return true;
  } catch (err) {
    console.error('[logActivity] Error logging activity:', err);
    // Don't throw - activity logging is non-critical
    return false;
  }
};

/**
 * Log when language specs are changed
 * 
 * @param userId - The user making the change
 * @param languageId - The language being modified
 * @param oldSpecs - The previous specs
 * @param newSpecs - The new specs
 */
export const logSpecsChange = async (
  userId: string,
  languageId: string,
  oldSpecs: Record<string, any>,
  newSpecs: Record<string, any>
) => {
  try {
    // Determine what changed
    const changes: string[] = [];
    
    if (oldSpecs.alphabetScript !== newSpecs.alphabetScript) {
      changes.push(`alphabet from ${oldSpecs.alphabetScript || 'unset'} to ${newSpecs.alphabetScript || 'unset'}`);
    }
    if (oldSpecs.writingDirection !== newSpecs.writingDirection) {
      changes.push(`writing direction from ${oldSpecs.writingDirection || 'unset'} to ${newSpecs.writingDirection || 'unset'}`);
    }
    if (oldSpecs.wordOrder !== newSpecs.wordOrder) {
      changes.push(`word order from ${oldSpecs.wordOrder || 'unset'} to ${newSpecs.wordOrder || 'unset'}`);
    }
    if (oldSpecs.depthLevel !== newSpecs.depthLevel) {
      changes.push(`depth level from ${oldSpecs.depthLevel || 'unset'} to ${newSpecs.depthLevel || 'unset'}`);
    }

    const description = changes.length > 0 
      ? `Updated language specs: ${changes.join('; ')}`
      : 'Updated language specs';

    await logActivity(
      userId,
      'specs_changed',
      languageId,
      description,
      {
        changes,
        oldSpecs,
        newSpecs,
      }
    );
  } catch (err) {
    console.error('[logSpecsChange] Error logging specs change:', err);
  }
};
