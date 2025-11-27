import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const referralCode = (params.code || '').trim()
    const url = new URL(request.url)
    const redirectTo = url.searchParams.get('to') || '/' // optional custom redirect

    if (!referralCode) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    const affiliate = await db.affiliates.findUnique({ where: { referralCode } })
    if (!affiliate) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    const xff = request.headers.get('x-forwarded-for') || ''
    const ip = xff.split(',')[0].trim() || ''
    const ua = request.headers.get('user-agent') || ''

    try {
      await db.affiliates.update({
        where: { id: affiliate.id },
        data: {
          totalVisits: (affiliate.totalVisits || 0) + 1,
          updatedAt: new Date(),
        },
      })
    } catch {}

    const res = NextResponse.redirect(new URL(redirectTo, request.url))
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    res.cookies.set('affiliate_referral', `${affiliate.id}:${referralCode}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires,
      path: '/',
    })
    res.cookies.set('affiliate_referral_meta', encodeURIComponent(JSON.stringify({ ip, ua })), {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}