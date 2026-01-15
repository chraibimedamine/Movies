import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function MovieGraph({ movieId }) {
    const svgRef = useRef(null)
    const containerRef = useRef(null)

    useEffect(() => {
        if (!movieId) return

        const fetchAndRenderGraph = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/movies/${movieId}/connections`)
                const data = await response.json()

                if (data.nodes && data.edges) {
                    renderGraph(data)
                }
            } catch (error) {
                console.error('Failed to fetch graph data:', error)
            }
        }

        fetchAndRenderGraph()
    }, [movieId])

    const renderGraph = (data) => {
        const container = containerRef.current
        const svg = d3.select(svgRef.current)

        // Clear previous graph
        svg.selectAll('*').remove()

        const width = container.clientWidth
        const height = container.clientHeight

        svg.attr('width', width).attr('height', height)

        // Color scale for node types
        const colorScale = {
            main: '#e50914',
            related: '#ff6b35',
            sameDirector: '#3498db',
        }

        // Create force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.edges).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(60))

        // Create container group
        const g = svg.append('g')

        // Add zoom behavior
        svg.call(d3.zoom()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                g.attr('transform', event.transform)
            }))

        // Create links
        const links = g.append('g')
            .selectAll('line')
            .data(data.edges)
            .enter()
            .append('line')
            .attr('class', 'graph-link')
            .attr('stroke', 'rgba(255, 255, 255, 0.2)')
            .attr('stroke-width', 2)

        // Create link labels
        const linkLabels = g.append('g')
            .selectAll('text')
            .data(data.edges)
            .enter()
            .append('text')
            .attr('class', 'graph-link-label')
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .attr('font-size', '10px')
            .text(d => d.label)

        // Create nodes
        const nodes = g.append('g')
            .selectAll('g')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', 'graph-node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))

        // Add circles to nodes
        nodes.append('circle')
            .attr('r', d => d.type === 'main' ? 35 : 25)
            .attr('fill', d => colorScale[d.type])
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)

        // Add labels to nodes
        nodes.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', d => d.type === 'main' ? 50 : 40)
            .attr('fill', '#fff')
            .attr('font-size', d => d.type === 'main' ? '12px' : '10px')
            .attr('font-weight', d => d.type === 'main' ? '600' : '400')
            .text(d => d.label.length > 20 ? d.label.substring(0, 18) + '...' : d.label)

        // Click handler for navigation
        nodes.on('click', (event, d) => {
            if (d.type !== 'main') {
                window.location.href = `/movie/${d.id}`
            }
        })

        // Update positions on tick
        simulation.on('tick', () => {
            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)

            linkLabels
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2)

            nodes.attr('transform', d => `translate(${d.x}, ${d.y})`)
        })

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
        }

        function dragged(event, d) {
            d.fx = event.x
            d.fy = event.y
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }
    }

    return (
        <div className="graph-container" ref={containerRef}>
            <svg ref={svgRef}></svg>
        </div>
    )
}

export default MovieGraph
