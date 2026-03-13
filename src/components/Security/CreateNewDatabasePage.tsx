import { useState, useEffect, useRef } from 'react';
import { Database, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { decryptData } from '../../services/encryptionService';
import apiClient from '../../services/apiClient';
import { Footer } from '../Footer/Footer';

const SCRIPT_LINES = [
    '-- Initializing database creation process...',
    'USE [master]',
    'GO',
    'IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N\'{dbName}\')',
    'BEGIN',
    '    CREATE DATABASE [{dbName}]',
    'END',
    'GO',
    '',
    '-- Switching to new database...',
    'USE [{dbName}]',
    'GO',
    '',
    '-- Creating schema and core tables...',
    'CREATE TABLE [dbo].[CompanyInfo] (',
    '    [Id]          INT           IDENTITY(1,1) PRIMARY KEY,',
    '    [CompanyCode] NVARCHAR(50)  NOT NULL,',
    '    [CompanyName] NVARCHAR(255) NOT NULL,',
    '    [CreatedAt]   DATETIME      DEFAULT GETDATE()',
    ')',
    'GO',
    '',
    '-- Setting up stored procedures...',
    "EXEC sp_configure 'show advanced options', 1",
    'RECONFIGURE',
    'GO',
    '',
    '-- Inserting initial company configuration...',
    'INSERT INTO [dbo].[CompanyInfo] (CompanyCode, CompanyName)',
    "VALUES ('{companyCode}', '{companyName}')",
    'GO',
    '',
    '-- Running post-install scripts...',
    'EXEC [dbo].[usp_InitializeDefaults]',
    'GO',
    '',
    '-- Applying security configurations...',
    'GRANT EXECUTE TO [AppRole]',
    'GO',
    '',
    '-- Finalizing...',
];

export function CreateNewDatabasePage() {
    const [serverList, setServerList]         = useState<string[]>([]);
    const [serverName, setServerName]         = useState('');
    const [displayServers, setDisplayServers] = useState<string[]>([]);
    const [databaseName, setDatabaseName]     = useState('');
    const [username, setUsername]             = useState('');
    const [password, setPassword]             = useState('');
    const [companyCode, setCompanyCode]       = useState('');
    const [companyName, setCompanyName]       = useState('');
    const [activeTab, setActiveTab]           = useState<'results' | 'scripts'>('results');
    const [resultsText, setResultsText]       = useState('');
    const [isProcessing, setIsProcessing]     = useState(false);
    const [scriptLines, setScriptLines]       = useState<string[]>([]);

    const scriptContainerRef = useRef<HTMLDivElement>(null);
    const scriptIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchServers();
        fetchCompanyInformation();
    }, []);

    // Scroll terminal container (never the page)
    useEffect(() => {
        if (scriptContainerRef.current) {
            scriptContainerRef.current.scrollTop = scriptContainerRef.current.scrollHeight;
        }
    }, [scriptLines]);

    const fetchServers = async () => {
        try {
            const res = await apiClient.get('/Security/DatabaseConfiguration/servers');
            const encrypted: string[] = res.data.servers ?? [];
            const decrypted = encrypted.map((s: string) => decryptData(s));
            setServerList(encrypted);
            setDisplayServers(decrypted);
            if (encrypted.length > 0) setServerName(encrypted[0]);
        } catch {
            setResultsText('Failed to load server list.');
        }
    };

    const fetchCompanyInformation = async () => {
        try {
            const response = await apiClient.get('/Fs/System/CompanyInformation');
            if (response.status === 200 && response.data) {
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                if (data?.companyCode) setCompanyCode(data.companyCode);
                if (data?.companyName) setCompanyName(data.companyName);
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                'Failed to load company information';
            await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        }
    };

    const handleServerChange = (index: number) => setServerName(serverList[index]);

    // Start script animation — loops the last few lines if API hasn't responded yet
    const startScriptAnimation = (dbName: string, code: string, name: string) => {
        setScriptLines([]);
        setActiveTab('scripts');

        const lines: string[] = SCRIPT_LINES
            .map(l =>
                l.replace(/\{dbName\}/g, dbName)
                 .replace(/\{companyCode\}/g, code)
                 .replace(/\{companyName\}/g, name)
            )
            .filter((l): l is string => typeof l === 'string');

        let i = 0;
        scriptIntervalRef.current = setInterval(() => {
            if (i < lines.length) {
                // Keep animating — do NOT stop when lines run out
                setScriptLines(prev => [...prev, lines[i]]);
                i++;
            }
            // When we've shown all lines, just let the blinking cursor keep going
            // The interval is cleared explicitly by stopScriptAnimation()
        }, 60);
    };

    const stopScriptAnimation = () => {
        if (scriptIntervalRef.current) {
            clearInterval(scriptIntervalRef.current);
            scriptIntervalRef.current = null;
        }
    };

    const handleCreate = async () => {
        if (!databaseName || !companyCode || !companyName) {
            await Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all required fields.',
            });
            return;
        }
        if (!username || !password) {
            await Swal.fire({
                icon: 'warning',
                title: 'Missing Credentials',
                text: 'Please enter SQL Server credentials.',
            });
            return;
        }

        setIsProcessing(true);
        setResultsText('');
        startScriptAnimation(databaseName, companyCode, companyName);

        try {
            const res = await apiClient.post(
                '/Security/DatabaseConfiguration/create',
                {
                    serverName,
                    databaseName,
                    authenticationType: 'SqlServer',
                    username,
                    password,
                    companyCode,
                    companyName,
                },
                { timeout: 300_000 }
            );

            const result = res.data;

            if (result.success) {
                const successText =
                    'Message  : ' + result.message + '\n' +
                    'Server   : ' + decryptData(serverName) + '\n' +
                    'Database : ' + result.databaseName + '\n' +
                    'Created  : ' + result.createdAt;

                setResultsText(successText);
                setActiveTab('results');
                setDatabaseName(''); // clear the input field

                stopScriptAnimation();
                await Swal.fire({
                    icon: 'success',
                    title: 'Database Created',
                    html: '<b>' + result.databaseName + '</b> was created successfully.',
                    confirmButtonColor: '#2563eb',
                });
            } else {
                const errorText =
                    '❌ ' + result.message +
                    (result.errorDetails ? '\n\nDetails:\n' + result.errorDetails : '');

                setResultsText(errorText);
                setActiveTab('results');

                stopScriptAnimation();
                await Swal.fire({
                    icon: 'error',
                    title: 'Creation Failed',
                    text: result.message,
                    footer: result.errorDetails ? '<small>' + result.errorDetails + '</small>' : undefined,
                });
            }
        } catch (err: any) {
            const data         = err?.response?.data;
            const message      = data?.message ?? 'Unexpected error. Please check the server.';
            const errorDetails = data?.errorDetails ?? '';

            setResultsText('❌ ' + message + (errorDetails ? '\n\nDetails:\n' + errorDetails : ''));
            setActiveTab('results');

            // Stop animation right before showing the Swal
            stopScriptAnimation();

            const combinedText = (message + ' ' + errorDetails).toLowerCase();

            if (
                combinedText.includes('login failed') ||
                combinedText.includes('authentication') ||
                combinedText.includes('password') ||
                combinedText.includes('invalid credentials')
            ) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Authentication Failed',
                    html:
                        '<p style="margin-bottom:8px;">The SQL Server credentials you entered are invalid.</p>' +
                        (errorDetails
                            ? '<p style="font-size:13px;font-family:monospace;background:#fef2f2;color:#ef4444;padding:8px;border-radius:6px;text-align:center;">' + errorDetails + '</p>'
                            : ''),
                    confirmButtonColor: '#2563eb',
                });
            } else if (
                combinedText.includes('already exists') ||
                combinedText.includes('database exists')
            ) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Database Already Exists',
                    html:
                        '<p style="margin-bottom:8px;">A database named <b>' + databaseName + '</b> already exists on this server.</p>' +
                        '<p style="font-size:13px;color:#6b7280;">Please choose a different name and try again.</p>' +
                        (errorDetails
                            ? '<p style="font-size:13px;font-family:monospace;background:#fefce8;color:#92400e;padding:8px;border-radius:6px;text-align:left;margin-top:8px;">' + errorDetails + '</p>'
                            : ''),
                    confirmButtonColor: '#2563eb',
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Creation Failed',
                    html:
                        '<p style="margin-bottom:8px;">' + message + '</p>' +
                        (errorDetails
                            ? '<p style="font-size:13px;font-family:monospace;background:#fef2f2;color:#ef4444;padding:8px;border-radius:6px;text-align:left;">' + errorDetails + '</p>'
                            : ''),
                    confirmButtonColor: '#2563eb',
                });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const inputClass = () =>
        'w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-colors ' +
        (isProcessing
            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-0'
            : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500');

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 relative z-10 p-6">
                <div className="max-w-7xl mx-auto relative">

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                        <h1 className="text-white">Create New Database</h1>
                    </div>

                    <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

                        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Database className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Create a new database for a company with all required tables,
                                        stored procedures, and initial configurations.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        {[
                                            'Initialize database schema and tables',
                                            'Set up stored procedures and functions',
                                            'Configure company information',
                                            'SQL Server Authentication support',
                                        ].map(text => (
                                            <div key={text} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600">{text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Left — Configuration */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                <h3 className="text-gray-900 mb-4">Database Configuration</h3>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-gray-700 text-sm mb-2">Server Name</label>
                                        <select
                                            disabled={isProcessing}
                                            onChange={(e) => handleServerChange(Number(e.target.value))}
                                            className={inputClass()}
                                        >
                                            {displayServers.map((name, i) => (
                                                <option key={i} value={i}>{name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm mb-2">Database Name</label>
                                        <input
                                            type="text"
                                            value={databaseName}
                                            readOnly={isProcessing}
                                            onChange={(e) => setDatabaseName(e.target.value)}
                                            className={inputClass()}
                                            placeholder="Enter database name"
                                        />
                                    </div>

                                    <div className="bg-white rounded border border-gray-200 p-4">
                                        <h4 className="text-gray-700 text-sm mb-3">SQL Server Authentication</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1">Username</label>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    readOnly={isProcessing}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className={inputClass()}
                                                    placeholder="Enter username"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1">Password</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    readOnly={isProcessing}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className={inputClass()}
                                                    placeholder="Enter password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded border border-gray-200 p-4">
                                        <h4 className="text-gray-700 text-sm mb-3">Company Details</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1">Code</label>
                                                <input
                                                    type="text"
                                                    value={companyCode}
                                                    readOnly={isProcessing}
                                                    onChange={(e) => setCompanyCode(e.target.value)}
                                                    className={inputClass()}
                                                    placeholder="Enter company code"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-600 text-sm mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    readOnly={isProcessing}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    className={inputClass()}
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleCreate}
                                            disabled={isProcessing}
                                            className="px-8 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Database className="w-4 h-4" />
                                            {isProcessing ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Output */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('results')}
                                        className={'px-4 py-2 text-sm transition-colors ' + (
                                            activeTab === 'results'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        )}
                                    >
                                        Results
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('scripts')}
                                        className={'px-4 py-2 text-sm transition-colors ' + (
                                            activeTab === 'scripts'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        )}
                                    >
                                        Scripts
                                        {isProcessing && (
                                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                    </button>
                                </div>

                                <div
                                    ref={scriptContainerRef}
                                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 h-[500px] overflow-auto"
                                >
                                    {activeTab === 'results' && (
                                        <div className="text-sm whitespace-pre-wrap font-mono text-green-400">
                                            {resultsText || (
                                                <span className="text-gray-500">
                                                    No results yet. Click "Create" to initialize the database.
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'scripts' && (
                                        <div className="text-sm font-mono">
                                            {scriptLines.length === 0 && !isProcessing && (
                                                <span className="text-gray-500">
                                                    -- Script output will appear here when you click Create.
                                                </span>
                                            )}
                                            {scriptLines.map((line, i) => {
                                                if (typeof line !== 'string') return null;
                                                const isComment = line.startsWith('--');
                                                const isKeyword = /^(USE|GO|BEGIN|END|CREATE|INSERT|EXEC|GRANT|RECONFIGURE)\b/.test(line.trim());
                                                const isEmpty   = line.trim() === '';
                                                const color = isComment
                                                    ? 'text-gray-500'
                                                    : isKeyword
                                                        ? 'text-blue-400'
                                                        : 'text-green-300';
                                                return (
                                                    <div key={i} className={'leading-relaxed ' + color + (isEmpty ? ' h-3' : '')}>
                                                        {isEmpty ? '\u00A0' : line}
                                                    </div>
                                                );
                                            })}
                                            {isProcessing && (
                                                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      <Footer />
    </div>
  );
}