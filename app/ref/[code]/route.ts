import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const referralCode = (params.code || '').trim()
    const home = new URL('/', request.url)

    if (!referralCode) {
      return NextResponse.redirect(home)
    }

    const affiliate = await db.affiliates.findUnique({ where: { referralCode } })
    if (!affiliate) {
      return NextResponse.redirect(home)
    }
    if (affiliate.status !== 'active') {
      return NextResponse.redirect(home)
    }

    const xff = request.headers.get('x-forwarded-for') || ''
    const ip = xff.split(',')[0].trim() || ''
    const ua = request.headers.get('user-agent') || ''

    await db.affiliates.update({
      where: { id: affiliate.id },
      data: {
        totalVisits: (affiliate.totalVisits || 0) + 1,
        updatedAt: new Date(),
      },
    })

    const res = NextResponse.redirect(home)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const isHttps = home.protocol === 'https:'
    res.cookies.set('affiliate_referral', `${affiliate.id}:${referralCode}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      expires,
      path: '/',
    })
    res.cookies.set('affiliate_referral_meta', encodeURIComponent(JSON.stringify({ ip, ua })), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      expires,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}