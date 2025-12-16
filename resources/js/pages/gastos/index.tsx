import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { GastosTab } from '@/pages/gastos/GastosTab';
import { ParcelasTab } from '@/pages/gastos/ParcelasTab';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[][] = [
    [{ title: 'Gastos', href: '/gastos' }],
    [
        { title: 'Gastos', href: '/gastos' },
        { title: 'Parcelas', href: '/gastos' },
    ],
];

export default function GastosIndex() {
    const [activeTab, setActiveTab] = useState<'gastos' | 'parcelas'>('gastos');

    return (
        <AppLayout breadcrumbs={breadcrumbs[activeTab === 'gastos' ? 0 : 1]}>
            <Head title="Gastos" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <ToggleGroup
                        type="single"
                        value={activeTab}
                        className="rounded-lg bg-muted p-1 w-full flex"
                        onValueChange={(v) => {
                            if (!v) return;
                            setActiveTab(v as 'gastos' | 'parcelas');
                        }}
                    >
                        <ToggleGroupItem
                            value="gastos"
                            className="flex-1 h-9 px-4 text-muted-foreground data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm cursor-pointer"
                        >
                            Gastos
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="parcelas"
                            className="flex-1 h-9 px-4 text-muted-foreground data-[state=on]:bg-gradient-to-r data-[state=on]:from-emerald-500 data-[state=on]:to-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm cursor-pointer"
                        >
                            Parcelas
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {activeTab === 'gastos' ? (
                    <GastosTab />
                ) : (
                    <ParcelasTab />
                )}
            </div>
        </AppLayout>
    );
}
