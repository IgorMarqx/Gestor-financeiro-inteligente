import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/assets/imgs/logo_financeiro.png"
            alt="Gestor Financeiro Inteligente"
            loading="lazy"
            decoding="async"
            {...props}
        />
    )
}
