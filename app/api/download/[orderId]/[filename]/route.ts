import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string; filename: string } }
) {
  try {
    // Verificar se o pedido existe e foi pago
    const order = await prisma.order.findUnique({
      where: {
        id: params.orderId
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Pedido não foi pago' },
        { status: 403 }
      );
    }

    // Verificar se o arquivo solicitado é válido para este pedido
    const allowedFiles = getAllowedFilesForOrder(order);
    if (!allowedFiles.includes(params.filename)) {
      return NextResponse.json(
        { error: 'Arquivo não autorizado para este pedido' },
        { status: 403 }
      );
    }

    // Caminho do arquivo
    const filePath = path.join(process.cwd(), 'public', 'downloads', params.filename);

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = fs.readFileSync(filePath);

    // Determinar Content-Type baseado na extensão
    const ext = path.extname(params.filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${params.filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getAllowedFilesForOrder(order: any): string[] {
  const files = [];

  // Arquivo principal baseado no idioma
  const isSpanish = order.source?.includes('_es') || order.source?.includes('es_');
  if (isSpanish) {
    files.push('plantilla-finanzas-es.xlsx');
  } else {
    files.push('plantilla-finanzas-pt.xlsx');
  }

  // Arquivos dos order bumps
  if (order.orderBumps?.includes('bonusGuides')) {
    files.push('bonus-guias.zip');
  }

  if (order.orderBumps?.includes('videoTutorial')) {
    files.push('video-tutorial.zip');
  }

  if (order.orderBumps?.includes('supportPriority')) {
    files.push('soporte-premium.pdf');
  }

  return files;
}