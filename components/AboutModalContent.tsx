
import React from 'react';

const AboutModalContent: React.FC = () => (
    <div>
        <h2 className="text-3xl font-bold text-custom-dark-orange mb-4 flex items-center">
            <span className="text-4xl mr-3">🥑</span> Sobre Mim
        </h2>
        <div className="space-y-4 text-lg text-gray-700">
            <p>
                Olá! Este aplicativo foi criado com paixão para inspirar a criatividade e a contação de histórias.
            </p>
            <p>
                A ideia é oferecer um espaço simples e divertido para que todos, de crianças a adultos, possam dar vida às suas ideias de forma visual e intuitiva.
            </p>
            <p className="pt-4 border-t border-gray-200">
                Feito com React, TypeScript e Tailwind CSS.
            </p>
        </div>
  </div>
);

export default AboutModalContent;
