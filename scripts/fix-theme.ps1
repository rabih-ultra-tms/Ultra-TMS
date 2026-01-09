# Fix Theme - Remove dark mode classes and update colors to slate
# This script updates all TSX files in apps/web to use the light theme

$files = Get-ChildItem -Path "apps\web\app" -Filter "*.tsx" -Recurse

$replacements = @{
    # Text colors
    'text-gray-900 dark:text-white' = 'text-slate-900'
    'text-gray-800 dark:text-white' = 'text-slate-900'
    'text-gray-700 dark:text-white' = 'text-slate-900'
    'text-gray-600 dark:text-gray-400' = 'text-slate-600'
    'text-gray-600 dark:text-gray-300' = 'text-slate-600'
    'text-gray-500 dark:text-gray-400' = 'text-slate-500'
    'text-gray-500 dark:text-gray-300' = 'text-slate-500'
    'text-gray-900 ' = 'text-slate-900 '
    'text-gray-600 ' = 'text-slate-600 '
    'text-gray-500 ' = 'text-slate-500 '
    
    # Background colors
    'bg-white dark:bg-gray-800' = 'bg-white'
    'bg-white dark:bg-gray-900' = 'bg-white'
    'bg-gray-50 dark:bg-gray-800' = 'bg-slate-50'
    'bg-gray-100 dark:bg-gray-800' = 'bg-slate-100'
    'bg-gray-100 dark:bg-gray-900' = 'bg-slate-100'
    
    # Border colors
    'border-gray-300 dark:border-gray-600' = 'border-slate-300'
    'border-gray-200 dark:border-gray-700' = 'border-slate-200'
    
    # Blue alert/banner colors
    'dark:bg-blue-900/20' = 'bg-blue-50'
    'dark:text-blue-300' = 'text-blue-700'
    'dark:text-blue-200' = 'text-blue-700'
    'dark:border-blue-800' = 'border-blue-200'
    'text-blue-800 dark:text-blue-200' = 'text-blue-700'
    
    # Other badge/tag colors
    'bg-gray-100 text-gray-600' = 'bg-slate-100 text-slate-600'
    
    # Remove standalone dark mode classes
    ' dark:bg-gray-700' = ''
    ' dark:bg-gray-600' = ''
    ' dark:text-gray-300' = ''
    ' dark:text-gray-200' = ''
    ' dark:hover:bg-gray-700' = ''
    ' dark:hover:text-gray-200' = ''
}

$count = 0
$totalUpdated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        $count++
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "✓ Updated: $relativePath"
    }
    $totalUpdated++
}

Write-Host "`n✅ Processed $totalUpdated files, updated $count files"
Write-Host "Theme conversion complete!"
