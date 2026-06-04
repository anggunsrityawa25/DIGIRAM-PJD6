<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HospitalController;
use App\Http\Controllers\EmramAssessmentController;
use App\Http\Controllers\EmramInstrumentController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'DIGIRAM'
    ]);
});
// ── ROUTE PUBLIK ─────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::apiResource('hospitals', HospitalController::class);

// Instrumen EMRAM bisa diakses publik (GET) agar RS dapat fetch terbaru
// Parameter ?active_only=1 untuk RS (hanya tampilkan is_active=true)
Route::get('/emram-instrument', [EmramInstrumentController::class, 'index']);

// ── ROUTE TERTUTUP (butuh token) ─────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user()->load('hospital');
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Update profil pengguna
    Route::post('/user/update-profile', [AuthController::class, 'updateProfile']);

    // Assessment EMRAM
    Route::get   ('/emram-assessment',                            [EmramAssessmentController::class, 'index']);
    Route::post  ('/emram-assessment',                            [EmramAssessmentController::class, 'store']);
    Route::get   ('/emram-assessment/{id}',                       [EmramAssessmentController::class, 'show']);
    Route::put   ('/emram-assessment/{id}',                       [EmramAssessmentController::class, 'update']);
    Route::delete('/emram-assessment/{id}',                       [EmramAssessmentController::class, 'destroy']);
    Route::post  ('/emram-assessment/{id}/submit',                [EmramAssessmentController::class, 'submit']);
    Route::post  ('/emram-assessment/{id}/verify',                [EmramAssessmentController::class, 'verify']);
    Route::post  ('/emram-assessment/{id}/upload-evidence',       [EmramAssessmentController::class, 'uploadEvidence']);
    Route::get   ('/emram-assessment/{id}/evidence',              [EmramAssessmentController::class, 'getEvidence']);
    Route::get   ('/assessment-evidence/{id}',                    [EmramAssessmentController::class, 'showEvidence'])->name('assessment.evidence.show');
    Route::delete('/assessment-evidence/{id}',                    [EmramAssessmentController::class, 'deleteEvidence']);
    Route::get   ('/emram-my-assessments',                        [EmramAssessmentController::class, 'myAssessments']);

    // ── Instrumen EMRAM — manajemen oleh Dinkes ────────────────────────────
    Route::post  ('/emram-instrument/indicators',                 [EmramInstrumentController::class, 'storeIndicator']);
    Route::put   ('/emram-instrument/indicators/{id}',            [EmramInstrumentController::class, 'updateIndicator']);
    Route::delete('/emram-instrument/indicators/{id}',            [EmramInstrumentController::class, 'destroyIndicator']);
    Route::put   ('/emram-instrument/stages/{stage}',             [EmramInstrumentController::class, 'updateStage']);
    Route::post  ('/emram-instrument/bulk-reorder',               [EmramInstrumentController::class, 'bulkReorder']);
});
