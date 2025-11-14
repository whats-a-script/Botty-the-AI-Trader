import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { PricePoint } from '@/lib/types'

interface PriceChartProps {
  historicalData: PricePoint[]
  forecastData?: PricePoint[]
  height?: number
}

export function PriceChart({ historicalData, forecastData, height = 300 }: PriceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || historicalData.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 30, left: 60 }
    const width = svgRef.current.clientWidth
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const allData = [...historicalData, ...(forecastData || [])]
    
    const xScale = d3.scaleTime()
      .domain(d3.extent(allData, d => d.timestamp) as [number, number])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(allData, d => d.price)! * 0.98,
        d3.max(allData, d => d.price)! * 1.02
      ])
      .range([innerHeight, 0])

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => {
        const date = new Date(d as number)
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
      }))
      .attr('class', 'text-muted-foreground text-xs')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}`))
      .attr('class', 'text-muted-foreground text-xs')

    const line = d3.line<PricePoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.price))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(historicalData)
      .attr('fill', 'none')
      .attr('stroke', 'oklch(0.25 0.05 250)')
      .attr('stroke-width', 2)
      .attr('d', line)

    if (forecastData && forecastData.length > 0) {
      const forecastLine = [...historicalData.slice(-1), ...forecastData]
      
      g.append('path')
        .datum(forecastLine)
        .attr('fill', 'none')
        .attr('stroke', 'oklch(0.65 0.15 210)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line)

      g.selectAll('.forecast-dot')
        .data(forecastData)
        .enter()
        .append('circle')
        .attr('class', 'forecast-dot')
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => yScale(d.price))
        .attr('r', 3)
        .attr('fill', 'oklch(0.65 0.15 210)')
        .attr('opacity', 0.6)
    }

  }, [historicalData, forecastData, height])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      className="overflow-visible"
    />
  )
}
