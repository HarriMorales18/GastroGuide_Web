export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseCategory =
	| 'MOLECULAR_CUISNE'
	| 'INTERNATIONAL_CUISINE'
	| 'BASIC_TECHNIQUES'
	| 'RESTAURANT_MANAGEMENT'
	| 'BAKING'
	| 'MIXOLOGY'
	| 'PASTRY'
	| 'FOOD_PHOTOGRAPHY'
	| 'NUTRION'
	| 'SMMELIER';
export type CuisineType =
	| 'OTHER'
	| 'FUSION'
	| 'MEDITERRANEAN'
	| 'NONE'
	| 'MIDDLE_EASTERN'
	| 'LATIN_AMERICAN'
	| 'AMERICAN'
	| 'AFRICAN'
	| 'FRENCH'
	| 'ITALIAN'
	| 'ASIAN';

export type AccessModel = 'FREE' | 'PAID' | 'FREMIUM';

export interface CourseCreatePayload {
	title: string;
	description: string;
	difficultyLevel: DifficultyLevel;
	category: CourseCategory;
	cuisineType: CuisineType;
}

export interface CourseCreateResponse {
	id: number;
}

export interface CourseSummary {
	id?: number | string;
	title: string;
	description: string;
	difficultyLevel: DifficultyLevel;
	category: CourseCategory;
	cuisineType: CuisineType;
	coverImageUrl?: string;
	tags?: string;
	language?: string;
}

export interface CourseUpdatePayload {
	title: string;
	description: string;
	difficultyLevel: DifficultyLevel;
	category: CourseCategory;
	cuisineType: CuisineType;
	tags: string;
	language: string;
}

export interface ModuleCreatePayload {
	courseId: number | string;
	title: string;
	description: string;
}

export interface ModuleUpdatePayload {
	id: number | string;
	title: string;
	description: string;
}

export interface LessonCreatePayload {
	moduleId: number | string;
	title: string;
	description: string;
	isFreePreview: boolean;
	lessonType: string;
	videoUrl: string;
	resourceType: string;
	fileUrl: string;
}

export interface ModuleSummary {
	id: number | string;
	courseId: number | string;
	title: string;
	description: string;
}
