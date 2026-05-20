import {
  HTTP_ORIGIN_PREFIX,
  HTTP_PROTOCOL,
  HTTPS_ORIGIN_PREFIX,
  HTTPS_PROTOCOL
} from '../constants/domain';

function IsSupportedWebProtocol(protocol: string): boolean {
  return protocol === HTTP_PROTOCOL || protocol === HTTPS_PROTOCOL;
}

export function NormalizeWhitelistDomain(input: string): string | null {
  const trimmed_input = input.trim().toLowerCase();

  if (!trimmed_input) return null;
  try {
    const parsed_url = new URL(
      trimmed_input.includes('://')
        ? trimmed_input
        : `${HTTPS_ORIGIN_PREFIX}${trimmed_input}`
    );

    if (!IsSupportedWebProtocol(parsed_url.protocol)) return null;

    return parsed_url.host;
  } catch {
    return null;
  }
}

export function CreateOriginsFromWhitelistDomains(
  whitelist_domains: string[]
): string[] {
  return whitelist_domains.flatMap(domain => {
    const normalized_domain = NormalizeWhitelistDomain(domain);

    return normalized_domain
      ? [
          `${HTTPS_ORIGIN_PREFIX}${normalized_domain}`,
          `${HTTP_ORIGIN_PREFIX}${normalized_domain}`
        ]
      : [];
  });
}
