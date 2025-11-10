
import React from 'react';

const HelpModalContent: React.FC = () => (
  <div>
    <h2 className="text-3xl font-bold text-custom-blue mb-4">Como usar o "Crie sua própria história"</h2>
    <div className="space-y-4 text-lg text-gray-700">
        <p>
            Bem-vindo! Esta é uma ferramenta para você soltar a imaginação. Desenhe, escreva e organize suas ideias como quiser.
        </p>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Barra de Ferramentas:</strong> No topo da área de desenho, você pode escolher entre a caneta e a ferramenta de texto, selecionar cores e ajustar o tamanho do traço.</li>
            <li><strong>Adicionar Páginas:</strong> Clique no botão "+" na parte inferior para adicionar uma nova página à sua história.</li>
            <li><strong>Navegar entre Páginas:</strong> Clique nas miniaturas na parte inferior para mudar para a página desejada.</li>
            <li><strong>Reordenar Páginas:</strong> Clique e arraste uma miniatura para mudar sua posição na história.</li>
             <li><strong>Excluir Páginas:</strong> Clique no "X" vermelho em uma miniatura para removê-la.</li>
        </ul>
        <p className="font-semibold text-custom-blue">Divirta-se criando!</p>
    </div>
  </div>
);

export default HelpModalContent;
