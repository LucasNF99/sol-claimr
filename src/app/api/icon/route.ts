import { NextResponse } from 'next/server';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const countParam = searchParams.get('count');
  const solClaimParam = searchParams.get('solClaim');

  if (!countParam || !solClaimParam) {
    return NextResponse.json({ error: 'Count and solClaim parameters are required' }, { status: 400 });
  }

  const accountsToClose = parseInt(countParam, 10);
  const totalSolClaim = parseFloat(solClaimParam);

  if (isNaN(accountsToClose) || isNaN(totalSolClaim)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Regular.ttf');
  registerFont(fontPath, { family: 'Montserrat' });
  const fontPathB = path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf');
  registerFont(fontPathB, { family: 'MontserratB' });
  const fontPathT = path.join(process.cwd(), 'public', 'fonts', 'Oswald-Bold.ttf');
  registerFont(fontPathT, { family: 'Oswald' });

  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');


  context.fillStyle = '#000cff';
  context.fillRect(0, 0, width, height);

  context.fillStyle = '#fff';
  context.textAlign = 'center';

  context.font = 'bold 40px Oswald';
  context.fillText('SOLCLAIMR', width / 2, 70);

  context.font = '20px Montserrat';
  context.fillText('Account to Close:', width / 2, 140);
  context.font = 'bold 55px MontserratB';
  context.fillText(accountsToClose.toString(), width / 2, 190);

  context.font = '20px Montserrat';
  context.fillText('Total SOL Claim:', width / 2, 270);
  context.font = 'bold 50px MontserratB';
  context.fillText(totalSolClaim.toFixed(5), width / 2, 320);

  const buffer = canvas.toBuffer('image/png');
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
