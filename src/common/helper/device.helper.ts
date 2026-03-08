import { Request } from 'express';

export class DeviceHelper {
  static extractDeviceMeta(req: Request): {
    ip: string | null;
    deviceName: string | null;
    browser: string | null;
    os: string | null;
  } {
    const ip = this.getClientIp(req);
    const userAgent = this.getUserAgent(req);
    const headerDeviceName =
      (this.getHeader(req, 'sec-ch-ua-model') || '').trim() ||
      (this.getHeader(req, 'x-device-name') || '').trim() ||
      '';
    const { browser, os } = this.parseUserAgent(userAgent || '');
    const deviceName =
      headerDeviceName || this.detectDeviceName(userAgent || '') || null;

    return {
      ip,
      deviceName,
      browser,
      os,
    };
  }

  static getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (Array.isArray(forwarded)) {
      return (forwarded[0] || '').trim() || null;
    }
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim() || null;
    }
    return req.ip || null;
  }

  static getUserAgent(req: Request): string | null {
    const ua = req.headers['user-agent'];
    if (Array.isArray(ua)) return ua.join(' ');
    return typeof ua === 'string' ? ua : null;
  }

  static getHeader(req: Request, name: string): string | null {
    const value = req.headers[name];
    if (Array.isArray(value)) return value[0] || null;
    return typeof value === 'string' ? value : null;
  }

  static parseUserAgent(ua: string): {
    browser: string | null;
    os: string | null;
  } {
    const browser = this.detectBrowser(ua);
    const os = this.detectOS(ua);
    return { browser, os };
  }

  static detectBrowser(ua: string): string | null {
    const value = ua.toLowerCase();
    if (value.includes('edg/')) return 'Edge';
    if (value.includes('opr/') || value.includes('opera')) return 'Opera';
    if (value.includes('chrome/')) return 'Chrome';
    if (value.includes('safari/') && !value.includes('chrome/'))
      return 'Safari';
    if (value.includes('firefox/')) return 'Firefox';
    return ua ? 'Unknown' : null;
  }

  static detectOS(ua: string): string | null {
    const value = ua.toLowerCase();
    if (value.includes('windows')) return 'Windows';
    if (value.includes('android')) return 'Android';
    if (
      value.includes('iphone') ||
      value.includes('ipad') ||
      value.includes('ios')
    )
      return 'iOS';
    if (value.includes('mac os x') || value.includes('macintosh')) return 'Mac';
    if (value.includes('linux')) return 'Linux';
    return ua ? 'Unknown' : null;
  }

  static detectDeviceName(ua: string): string | null {
    const value = ua.toLowerCase();
    if (value.includes('iphone')) return 'iPhone';
    if (value.includes('ipad')) return 'iPad';
    if (value.includes('android')) return 'Android';
    if (value.includes('windows')) return 'Windows PC';
    if (value.includes('macintosh') || value.includes('mac os x')) return 'Mac';
    if (value.includes('linux')) return 'Linux PC';
    return ua ? 'Unknown' : null;
  }
}
