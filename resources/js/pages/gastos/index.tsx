import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { GastosTab } from '@/pages/gastos/GastosTab';
import { ParcelasTab } from '@/pages/gastos/ParcelasTab';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Gastos', href: '/gastos' }];

export default function GastosIndex() {
    const [activeTab, setActiveTab] = useState<'gastos' | 'parcelas'>('gastos');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gastos" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <ToggleGroup
                        type="single"
                        value={activeTab}
                        onValueChange={(v) => {
                            if (!v) return;
                            setActiveTab(v as 'gastos' | 'parcelas');
                        }}
                    >
                        <ToggleGroupItem value="gastos" className='cursor-pointer'>Gastos</ToggleGroupItem>
                        <ToggleGroupItem value="parcelas" className='cursor-pointer'>Parcelas</ToggleGroupItem>
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
