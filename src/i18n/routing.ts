import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['es', 'ca', 'eu', 'gl'],
  
  // Used when no locale matches
  defaultLocale: 'es'
});