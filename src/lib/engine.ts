/**
 * Aegis Command Normalization Layer
 * Handles Banglish, English, Hindi, and mixed-language commands locally.
 */

export type Intent = 
  | 'create_file' 
  | 'delete_file' 
  | 'edit_file'
  | 'open_module'
  | 'scan_folder' 
  | 'check_gmail' 
  | 'security_scan' 
  | 'ocr_image' 
  | 'system_status' 
  | 'confirm'
  | 'cancel'
  | 'clarify'
  | 'unknown';

export interface CommandResult {
  intent: Intent;
  target?: string;
  mode?: string;
  language: 'en' | 'bn' | 'hi' | 'ar' | 'mixed';
  original: string;
}

const INTENT_MAP: Record<string, Intent> = {
  'create': 'create_file',
  'banao': 'create_file',
  'koro': 'create_file',
  'toiri': 'create_file',
  'delete': 'delete_file',
  'muche': 'delete_file',
  'del': 'delete_file',
  'remove': 'delete_file',
  'soriye': 'delete_file',
  'kata': 'delete_file',
  'bad': 'delete_file',
  'edit': 'edit_file',
  'poriborton': 'edit_file',
  'change': 'edit_file',
  'open': 'open_module',
  'kholo': 'open_module',
  'chalao': 'open_module',
  'start': 'open_module',
  'scan': 'scan_folder',
  'porikkha': 'scan_folder',
  'check': 'check_gmail',
  'gmail': 'check_gmail',
  'mail': 'check_gmail',
  'security': 'security_scan',
  'antivirus': 'security_scan',
  'bipod': 'security_scan',
  'ocr': 'ocr_image',
  'text': 'ocr_image',
  'lekha': 'ocr_image',
  'status': 'system_status',
  'obostha': 'system_status',
  'ki khobor': 'system_status',
  'yes': 'confirm',
  'ha': 'confirm',
  'thik ache': 'confirm',
  'confirm': 'confirm',
  'ji': 'confirm',
  'no': 'cancel',
  'na': 'cancel',
  'cancel': 'cancel',
  'bad dao': 'cancel',
  'dorkar nai': 'cancel',
  'ki': 'clarify',
  'what': 'clarify',
  'how': 'clarify',
};

export function parseCommand(input: string): CommandResult {
  const normalized = input.toLowerCase().trim();
  let intent: Intent = 'unknown';
  let target = '';
  let mode = 'standard';
  let language: CommandResult['language'] = 'en';

  // Detect Language (Simple heuristic)
  if (/[অ-ঔক-য়]/.test(input)) language = 'bn';
  else if (normalized.includes('koro') || normalized.includes('dao') || normalized.includes('akta')) language = 'mixed';

  // Extract Intent
  let foundKeyword = '';
  for (const [keyword, mappedIntent] of Object.entries(INTENT_MAP)) {
    if (normalized.includes(keyword)) {
      intent = mappedIntent;
      foundKeyword = keyword;
      break;
    }
  }

  // Extract Target (Dynamic extraction)
  if (['delete_file', 'create_file', 'scan_folder', 'open_module', 'edit_file'].includes(intent)) {
    // Try to get everything after the keyword
    const parts = normalized.split(foundKeyword);
    if (parts.length > 1) {
      target = parts[1].replace(/file|folder|directory|akta|the|module|app|software/g, '').trim();
    }
  }

  // Fallback for hardcoded targets if dynamic failed or for specific types
  if (!target) {
    if (normalized.includes('excel')) target = 'excel';
    else if (normalized.includes('word')) target = 'word';
    else if (normalized.includes('downloads')) target = 'downloads';
    else if (normalized.includes('project')) target = 'project';
    else if (normalized.includes('vision')) target = 'vision';
    else if (normalized.includes('file')) target = 'files';
    else if (normalized.includes('security')) target = 'security';
  }

  // Extract Mode
  if (normalized.includes('quick') || normalized.includes('taratari')) mode = 'quick';
  if (normalized.includes('full') || normalized.includes('pura')) mode = 'full';

  return { intent, target, mode, language, original: input };
}
