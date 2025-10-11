import { COOKIE_LANG } from '@i18n/utils/constants';
import { negotiateFromHeaderString } from '@i18n/utils/negotiation';
import { normalizeBase } from '@i18n/utils/normalize';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RootRedirect() {
  const cookieLang = (await cookies()).get(COOKIE_LANG)?.value || null;
  if (cookieLang) redirect(`/${normalizeBase(cookieLang)}`);

  const header = (await headers()).get('accept-language') || '';
  const lang = negotiateFromHeaderString(header);
  redirect(`/${lang}`);
}
