"use client"

import React from "react"
import { motion } from "framer-motion"
import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"

const MOCK_INSTAGRAM_POSTS = [
    {
        id: "1",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=600&auto=format&fit=crop",
        likes: "1.2K",
        comments: "42",
        link: "https://instagram.com/sabinapolatova"
    },
    {
        id: "2",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=600&auto=format&fit=crop",
        likes: "856",
        comments: "18",
        link: "https://instagram.com/sabinapolatova"
    },
    {
        id: "3",
        imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=600&h=600&auto=format&fit=crop",
        likes: "2.3K",
        comments: "64",
        link: "https://instagram.com/sabinapolatova"
    },
    {
        id: "4",
        imageUrl: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&h=600&auto=format&fit=crop",
        likes: "1.1K",
        comments: "29",
        link: "https://instagram.com/sabinapolatova"
    }
]

export function InstagramSection({
    post1Url = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&h=600&auto=format&fit=crop",
    post2Url = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&h=600&auto=format&fit=crop",
    post3Url = "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=600&h=600&auto=format&fit=crop",
    post4Url = "https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=600&h=600&auto=format&fit=crop"
}: {
    post1Url?: string,
    post2Url?: string,
    post3Url?: string,
    post4Url?: string
}) {
    // Override the mock imageUrls with the props
    const dynamicPosts = MOCK_INSTAGRAM_POSTS.map((post, index) => {
        const urls = [post1Url, post2Url, post3Url, post4Url];
        return {
            ...post,
            imageUrl: urls[index] || post.imageUrl
        };
    });

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 text-[var(--accent)] mb-4"
                        >
                            <Instagram className="w-6 h-6" />
                            <span className="text-sm font-black uppercase tracking-[0.4em]">@sabina_polatova</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-editorial text-[var(--primary)] leading-tight"
                        >
                            Kundalik ilhom va <span className="italic">yoga olami</span>
                        </motion.h2>
                    </div>

                    <motion.a
                        href="https://instagram.com/sabinapolatova"
                        target="_blank"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group flex items-center gap-4 px-8 py-4 rounded-full border border-[var(--primary)] text-[var(--primary)] font-bold hover:bg-[var(--primary)] hover:text-white transition-all duration-500"
                    >
                        Instagramni kuzatish
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </motion.a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {dynamicPosts.map((post, idx) => (
                        <motion.a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100"
                        >
                            <Image
                                src={post.imageUrl}
                                alt="Instagram Post"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-[var(--primary)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-8">
                                <div className="flex flex-col items-center text-white">
                                    <Heart className="w-6 h-6 mb-2 fill-white" />
                                    <span className="text-sm font-bold">{post.likes}</span>
                                </div>
                                <div className="flex flex-col items-center text-white">
                                    <MessageCircle className="w-6 h-6 mb-2 fill-white" />
                                    <span className="text-sm font-bold">{post.comments}</span>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <p className="text-[10px] uppercase font-black tracking-[0.5em] text-[var(--primary)]/20 leading-relaxed">
                        ENG SO'NGGI YANGILIKLAR VA MASLAHATLAR IJTIMOIY TARMOQLARIMIZDA
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
