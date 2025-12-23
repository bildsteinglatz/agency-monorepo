'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MembershipDrawer } from './MembershipDrawer';

interface ProjectItem {
    title: string;
    description: string;
    price: string;
    checkoutUrl?: string;
}

interface MembershipProjectProps {
    projects: ProjectItem[];
}

export function MembershipProject({ projects }: MembershipProjectProps) {
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectProject = (project: ProjectItem) => {
        if (project.checkoutUrl) {
            window.location.href = project.checkoutUrl;
            return;
        }
        setSelectedProject(project);
        setIsOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    return (
        <>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={containerVariants}
                className="space-y-4"
            >
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 8 }}
                        onClick={() => handleSelectProject(project)}
                        className="cursor-pointer group"
                    >
                        <div className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all p-8 flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="text-2xl md:text-3xl font-black uppercase mb-2 text-black group-hover:text-black transition-colors">
                                    {project.title}
                                </h4>
                                <p className="text-xs md:text-sm font-bold uppercase text-black leading-tight">
                                    {project.description}
                                </p>
                            </div>
                            <motion.div
                                className="ml-8 bg-black text-white px-8 py-4 border-4 border-black font-black text-xl md:text-2xl uppercase whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-[#FF3100] transition-all"
                                whileHover={{
                                    scale: 1.1,
                                    rotate: -2,
                                    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
                                }}
                            >
                                {project.price}
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {selectedProject && (
                <MembershipDrawer
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title={selectedProject.title}
                    price={selectedProject.price}
                />
            )}
        </>
    );
}
