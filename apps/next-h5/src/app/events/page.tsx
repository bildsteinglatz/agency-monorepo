import { client } from "@/sanity/client";

export default async function Page() {
    const events = await client.fetch(`*[_type == "event"] | order(date desc)`);

    return (
        <main className="max-w-4xl mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">Events / News</h1>

            <div className="space-y-12">
                {events.map((event: any) => (
                    <article key={event._id} className="border-b border-gray-200 pb-8 last:border-0">
                        <div className="flex flex-col md:flex-row gap-8">
                            {event.image && (
                                <div className="md:w-1/3 aspect-[4/3] relative bg-gray-100 rounded overflow-hidden">
                                    <img
                                        src={client.config().dataset === 'production' ? `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${event.image.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}` : ''}
                                        alt={event.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                {event.date && (
                                    <time className="text-sm text-gray-500 uppercase tracking-widest mb-2 block">
                                        {new Date(event.date).toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </time>
                                )}
                                <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                                <div className="text-gray-700 leading-relaxed line-clamp-4">
                                    {/* Simplified text preview */}
                                    Click to read more about this event.
                                </div>
                            </div>
                        </div>
                    </article>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded">
                        <p className="text-gray-500 italic">Derzeit sind keine aktuellen Events eingetragen.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
