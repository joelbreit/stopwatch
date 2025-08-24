import React, { useState, useEffect, useRef, useMemo } from "react";
import {
	Play,
	Pause,
	RotateCcw,
	Flag,
	Download,
	Timer,
	Check,
} from "lucide-react";

// Helper function to format time from milliseconds to MM:SS.ms
const formatTime = (timeInMs) => {
	const date = new Date(timeInMs);
	const minutes = date.getUTCMinutes().toString().padStart(2, "0");
	const seconds = date.getUTCSeconds().toString().padStart(2, "0");
	const milliseconds = Math.floor(date.getUTCMilliseconds() / 10)
		.toString()
		.padStart(2, "0");
	return `${minutes}:${seconds}.${milliseconds}`;
};

// Main App Component
export default function App() {
	const [time, setTime] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [laps, setLaps] = useState([]);
	const intervalRef = useRef(null);
	const startTimeRef = useRef(0);

	// Effect to handle the timer logic
	useEffect(() => {
		if (isActive) {
			startTimeRef.current = Date.now() - time;
			intervalRef.current = setInterval(() => {
				setTime(Date.now() - startTimeRef.current);
			}, 10);
		} else {
			clearInterval(intervalRef.current);
		}
		return () => clearInterval(intervalRef.current);
	}, [isActive, time]);

	const handleStartStop = () => {
		setIsActive(!isActive);
	};

	const handleReset = () => {
		setIsActive(false);
		setTime(0);
		setLaps([]);
	};

	const handleLap = () => {
		if (isActive) {
			const totalTimeAtLap = time;
			const completedLapsDuration = laps.reduce(
				(sum, lap) => sum + lap.duration,
				0
			);
			const duration = totalTimeAtLap - completedLapsDuration;

			const newLap = {
				lap: laps.length + 1,
				duration,
				totalTime: totalTimeAtLap,
			};
			setLaps([newLap, ...laps]); // Add new lap to the beginning
		}
	};

	const handleCompleteLap = () => {
		if (isActive || time > 0) {
			const totalTimeAtLap = time;
			const completedLapsDuration = laps.reduce(
				(sum, lap) => sum + lap.duration,
				0
			);
			const duration = totalTimeAtLap - completedLapsDuration;

			const newLap = {
				lap: laps.length + 1,
				duration,
				totalTime: totalTimeAtLap,
			};
			setLaps([newLap, ...laps]);
			setIsActive(false);
		}
	};

	const currentLapTime = useMemo(() => {
		if (laps.length === 0) {
			return time;
		}
		const completedLapsDuration = laps.reduce(
			(sum, lap) => sum + lap.duration,
			0
		);
		return time - completedLapsDuration;
	}, [time, laps]);

	// Memoized calculations for average times
	const { averageSoFar, overallAverage } = useMemo(() => {
		if (laps.length === 0) {
			return {
				averageSoFar: 0,
				overallAverage: isActive ? time : 0,
			};
		}

		const completedLapsDurations = laps.map((lap) => lap.duration);
		const sumOfCompletedLaps = completedLapsDurations.reduce(
			(a, b) => a + b,
			0
		);
		const avgSoFar = sumOfCompletedLaps / laps.length;

		let ovrAvg = avgSoFar;
		if (isActive) {
			ovrAvg = time / (laps.length + 1);
		}

		return {
			averageSoFar: avgSoFar,
			overallAverage: ovrAvg,
		};
	}, [time, laps, isActive]);

	const handleExportToCSV = () => {
		if (laps.length === 0) return;

		const headers = [
			"Lap Number",
			"Lap Time (ms)",
			"Lap Time (formatted)",
			"Total Time (ms)",
			"Total Time (formatted)",
			"Timestamp",
		];
		const rows = laps.map((lap) => [
			lap.lap,
			lap.duration,
			formatTime(lap.duration),
			lap.totalTime,
			formatTime(lap.totalTime),
			new Date(lap.totalTime).toISOString(),
		]);

		const avgCompleted = averageSoFar;
		const avgWithCurrent = overallAverage;

		rows.push([]);
		rows.push(["Statistics"]);
		rows.push([
			"Average Lap Time (Completed)",
			avgCompleted,
			formatTime(avgCompleted),
		]);
		rows.push([
			"Average Lap Time (Including Current)",
			avgWithCurrent,
			formatTime(avgWithCurrent),
		]);
		rows.push(["Current Session Time", time, formatTime(time)]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `stopwatch_laps_${new Date()
			.toISOString()
			.slice(0, 10)}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	// Determine lap with min/max duration
	const { minLap, maxLap } = useMemo(() => {
		if (laps.length < 2) return { minLap: null, maxLap: null };
		let min = laps[0];
		let max = laps[0];
		laps.forEach((lap) => {
			if (lap.duration < min.duration) min = lap;
			if (lap.duration > max.duration) max = lap;
		});
		return { minLap: min.lap, maxLap: max.lap };
	}, [laps]);

	return (
		<div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-lg mx-auto flex flex-col items-center">
				{/* Header */}
				<div className="flex items-center justify-between w-full mb-10 pt-6">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
							<Timer className="w-8 h-8 text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-light text-white tracking-tight">
								Stopwatch
							</h1>
							<p className="text-sm text-slate-400 mt-1">
								Average Lap Time Tracker
							</p>
						</div>
					</div>
					{laps.length > 0 && (
						<button
							onClick={handleExportToCSV}
							className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 transition-all duration-200 shadow-lg"
						>
							<Download
								size={18}
								className="group-hover:-translate-y-0.5 transition-transform"
							/>
							Export Data
						</button>
					)}
				</div>
				{/* Main Timer Display - Current Lap Time */}
				<div className="text-7xl md:text-8xl font-mono tracking-tighter mb-2 w-full text-center">
					{formatTime(currentLapTime)}
				</div>
				{/* Secondary Display - Total Time */}
				<div className="text-lg font-mono text-gray-400 mb-8 w-full text-center">
					Total: {formatTime(time)}
				</div>

				{/* Control Buttons */}
				<div className="flex flex-col gap-4 w-full mb-8">
					{/* Main Control Row */}
					<div className="flex justify-between w-full">
						<button
							onClick={handleReset}
							disabled={time === 0}
							className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
						>
							<RotateCcw />
						</button>
						<button
							onClick={handleLap}
							disabled={!isActive}
							className="w-24 h-24 rounded-full flex items-center justify-center bg-orange-700 text-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
						>
							<Flag />
						</button>
						<button
							onClick={handleStartStop}
							className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
								isActive
									? "bg-red-900/50 text-red-400"
									: "bg-green-900/50 text-green-400"
							}`}
						>
							{isActive ? <Pause /> : <Play />}
						</button>

						<button
							onClick={handleCompleteLap}
							disabled={time === 0}
							className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-700 text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
						>
							<Check />
						</button>
					</div>
					{/* Complete Lap Button Row */}
					{/* <div className="flex justify-center w-full">
						<button
							onClick={handleCompleteLap}
							disabled={time === 0}
							className="w-48 h-16 rounded-full flex items-center justify-center bg-blue-700 text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
						>
							<Square className="w-5 h-5 mr-2" />
							Complete Lap
						</button>
					</div> */}
				</div>

				{/* Average Time Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8">
					<div className="bg-gray-800 p-4 rounded-lg text-center">
						<p className="text-sm text-gray-400">
							Average (Completed Laps)
						</p>
						<p className="text-2xl font-mono">
							{formatTime(averageSoFar)}
						</p>
					</div>
					<div className="bg-gray-800 p-4 rounded-lg text-center">
						<p className="text-sm text-gray-400">
							Overall Average (w/ Active)
						</p>
						<p className="text-2xl font-mono">
							{formatTime(overallAverage)}
						</p>
					</div>
				</div>

				{/* Laps Table */}
				<div className="w-full bg-gray-800 rounded-lg overflow-hidden">
					<div className="max-h-60 overflow-y-auto">
						<table className="w-full text-left font-mono">
							<thead className="sticky top-0 bg-gray-800">
								<tr>
									<th className="p-3 text-sm font-semibold text-gray-400">
										Lap
									</th>
									<th className="p-3 text-sm font-semibold text-gray-400">
										Lap Time
									</th>
									<th className="p-3 text-sm font-semibold text-gray-400 text-right">
										Total
									</th>
								</tr>
							</thead>
							<tbody>
								{laps.length > 0 ? (
									laps.map((lap) => (
										<tr
											key={lap.lap}
											className={`border-t border-gray-700 ${
												lap.lap === minLap
													? "text-green-400"
													: lap.lap === maxLap
													? "text-red-400"
													: ""
											}`}
										>
											<td className="p-3">
												{String(lap.lap).padStart(
													2,
													"0"
												)}
											</td>
											<td className="p-3">
												{formatTime(lap.duration)}
											</td>
											<td className="p-3 text-right">
												{formatTime(lap.totalTime)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="3"
											className="p-4 text-center text-gray-500"
										>
											No laps recorded.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
