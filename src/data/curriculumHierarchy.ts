import {
  BoardDefinition,
  Chapter,
  ClassLevel,
  SubjectId,
} from '../types';
import { MASTER_CURRICULUM_DATABASE, SUPPORTED_BOARDS, ALL_CLASSES } from './curriculumDatabase';

export const BOARDS: BoardDefinition[] = SUPPORTED_BOARDS.map((b) => ({
  id: b.id,
  name: b.name,
  fullName: b.fullName,
  country: b.country,
}));

export const CLASSES: { level: ClassLevel; label: string }[] = ALL_CLASSES.map((c) => ({
  level: c.level,
  label: `${c.label} (${c.stage})`,
}));

// Export centralized master curriculum database
export const HIERARCHICAL_CURRICULUM: Chapter[] = MASTER_CURRICULUM_DATABASE;
