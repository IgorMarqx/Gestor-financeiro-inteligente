import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-sidebar-primary/10">
                <AppLogoIcon className="size-24 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold text-sidebar-foreground">
                    Gestor Financeiro Inteligente
                </span>
            </div>
        </>
    );
}
